import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecoveryRun,applyRecoveryAction,responseOptions,serializeRun,restoreRun} from '../src/recoverWell/recoveryRun.js';
import {resolveRecovery} from '../src/recoverWell/recoveryResolver.js';
import {standaloneHandoff} from '../src/recoverWell/leaveWellHandoff.js';
import {recoveryInvestmentLedger} from '../src/recoverWell/recoveryInvestmentLedger.js';
const handoff=standaloneHandoff('supported');
function advance(run,type,props={},n=1){return applyRecoveryAction(run,{id:'safety-'+n,type,...props})}
function investedRun({first='4A',second=null,scenarioId='S2',handoff:source=handoff}={}){
 const byId=id=>({'1':'personalized','2':'rehab','3':'warning','4':'response'}[id[0]]);
 let r=createRecoveryRun({handoff:source,runId:'stress-'+first+'-'+(second||'none')+'-'+scenarioId,scenarioId});
 let n=0;const a=(type,props={})=>{r=advance(r,type,props,++n);return r};
 a('next');
 const buy=id=>{a('invest',{capabilityId:byId(id)});a('next');a('design',{designId:id});a('next')};
 buy(first);
 if(second){a('strategy',{choice:'extend'});buy(second);}
 else a('strategy',{choice:'strengthen'});
 return r;
}
test('Recover Well cannot spend below zero; blocked decisions never mutate the original run',()=>{
 const run=investedRun({first:'4A',second:'2B'});
 assert.equal(run.capital,1);
 assert.equal(run.change,1);
 assert.equal(run.phase,'event');
 assert.throws(()=>advance(run,'strategy',{choice:'strengthen'},999),/current stage/);
 assert.throws(()=>advance(run,'invest',{capabilityId:'warning'},998),/current stage/);
 assert.throws(()=>advance(run,'respond',{choice:'ordinary'},997),/current stage/);
 assert.equal(run.capital,1);
 assert.equal(run.change,1);
 assert.equal(run.phase,'event');
});
test('Every event retains at least one response even after the most expensive legal Extend portfolio',()=>{
 for(const scenarioId of ['S1','S2','S3'])for(const handoff of [standaloneHandoff('supported'),standaloneHandoff('open')]){
  const r=investedRun({first:'4A',second:'2B',scenarioId,handoff});
  const base=advance(r,'revealImpact',{},50);
  const respond=advance(base,'next',{},51);
  const opts=responseOptions(respond);
  assert.equal(opts.ordinary.eligible,true);
  assert.equal(opts.ordinary.affordable,true);
  const final=advance(respond,'respond',{choice:'ordinary'},52);
  assert.equal(final.phase,'result');
  assert.ok(final.capital>=0&&final.change>=0);
 }
});
test('Tampered saved results, budgets, and recovery passport fail replay validation',()=>{
 const r=investedRun({first:'4A',scenarioId:'S2'});
 const baseline=advance(r,'revealImpact',{},50);
 const respond=advance(baseline,'next',{},51);
 const done=advance(respond,'respond',{choice:'use'},52);
 const saved=JSON.parse(serializeRun(done));
 const changedBudget=structuredClone(saved);changedBudget.finalBudget.capital+=1;
 assert.throws(()=>restoreRun(JSON.stringify(changedBudget)),/does not match/);
 const changedOutcome=structuredClone(saved);changedOutcome.result.outcome='EXPOSED';
 assert.throws(()=>restoreRun(JSON.stringify(changedOutcome)),/does not match/);
 const changedPassport=structuredClone(saved);changedPassport.exitPassport.dependencies.ongoingMonitoringOwnerConfirmed=true;
 assert.throws(()=>restoreRun(JSON.stringify(changedPassport)),/passport does not match/);
 assert.equal(restoreRun(JSON.stringify(saved)).result.outcome,done.result.outcome);
});
test('No clinical ownership is invented when real qualified assessment acceptance is unavailable',()=>{
 const p={handoff,investments:[{designId:'4A',strengthened:true}],scenarioId:'S2',facts:{assessmentAccepted:false,receivingAccepted:false,receivingCapacity:false}};
 for(const response of ['use','ordinary','escalate','adapt']){
  const r=resolveRecovery({...p,response});
  assert.equal(r.outcome,'EXPOSED',response);
  assert.ok(!r.path.complete,response);
 }
});
test('Realized strengthened robot safe-deferral is attributed, but a bare purchase is not',()=>{
 const p={handoff,scenarioId:'S3'};
 const bare=resolveRecovery({...p,investments:[{designId:'2C',strengthened:false}],response:'use'});
 const strong=resolveRecovery({...p,investments:[{designId:'2C',strengthened:true}],response:'use'});
 assert.equal(bare.outcome,'EXPOSED');
 assert.equal(strong.outcome,'HOLDS');
 assert.equal(strong.path.localTaskMode,'safe-deferral');
 assert.ok(strong.strengthUses.some(x=>x.designId==='2C'));
 const ledger=recoveryInvestmentLedger([{designId:'2C',strengthened:true}],strong);
 assert.equal(ledger[0].status,'USED IN THIS RESPONSE');
 assert.equal(ledger[0].used,true);
});
