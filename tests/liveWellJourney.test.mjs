import test from 'node:test';
import assert from 'node:assert/strict';
import {createLiveRun,applyLiveAction,restoreLiveRun,serializeLiveRun} from '../src/liveWell/liveRun.js';
import {DESIGNS,legalPortfolios,makeLiveStart} from '../src/liveWell/liveResolver.js';
const action=(r,type,props={})=>applyLiveAction(r,{id:'act-'+r.actions.length,type,...props});
function play({id='live-complete',first='1B',second=null,scenarioId='S1',response='use'}={}){
 let r=createLiveRun({runId:id,start:makeLiveStart(),scenarioId});
 r=action(r,'next');r=action(r,'family',{familyId:DESIGNS[first].familyId});r=action(r,'design',{designId:first});
 if(second){r=action(r,'strategy',{choice:'extend'});r=action(r,'family',{familyId:DESIGNS[second].familyId});r=action(r,'design',{designId:second})}
 else r=action(r,'strategy',{choice:'strengthen'});
 r=action(r,'next');r=action(r,'respond',{choice:response});r=action(r,'next');r=action(r,'next');
 return r;
}
test('Live Well end-to-end Strengthen run has outcome, futures, saved local state and valid actions',()=>{
 const r=play();
 assert.equal(r.phase,'finale');assert.equal(r.strategy,'strengthen');assert.equal(r.investments.length,1);
 assert.ok(r.result?.metrics.future);assert.deepEqual(restoreLiveRun(serializeLiveRun(r)),r);
 assert.equal(r.capital,r.result.remaining.capital);
});
test('Live Well end-to-end Extend run has two different investment families and valid accounting',()=>{
 const r=play({id:'extend-case',first:'1B',second:'3C',scenarioId:'S3'});
 assert.equal(r.phase,'finale');assert.equal(r.strategy,'extend');assert.equal(r.investments.length,2);
 assert.deepEqual(restoreLiveRun(serializeLiveRun(r)),r);
});
test('All 12 designs can complete a strengthened run and survive save/resume',()=>{
 for(const id of Object.keys(DESIGNS))for(const s of ['S1','S2','S3']){
  const r=play({id:'p-'+id+'-'+s,first:id,scenarioId:s});
  assert.equal(r.phase,'finale');
  assert.ok(r.result.route.reason);
  assert.deepEqual(restoreLiveRun(serializeLiveRun(r)),r);
 }
});
test('All 66 legal investment portfolios can finish the third chapter',()=>{
 for(const [i,p]of legalPortfolios().entries()){
  const ids=p.investments.map(x=>x.designId);
  const r=play({id:'folio-'+i,first:ids[0],second:ids[1]||null,scenarioId:['S1','S2','S3'][i%3]});
  assert.equal(r.result?.schema,'lw3-causal-v0.1');
 }
});
test('Live Well refuses skipped phases and impossible resource commitments',()=>{
 let r=createLiveRun({runId:'guard'});
 assert.throws(()=>action(r,'respond',{choice:'use'}),/current/);
 r=action(r,'next');r=action(r,'family',{familyId:'care'});
 r=action(r,'design',{designId:'2A'});
 assert.throws(()=>action(r,'family',{familyId:'services'}),/current/);
 r=action(r,'strategy',{choice:'extend'});
 assert.throws(()=>action(r,'family',{familyId:'care'}),/different/);
 r=action(r,'family',{familyId:'services'});
 assert.throws(()=>action(r,'design',{designId:'4A'}),/Insufficient/);
});
test('Replay detects changed choice outcomes, costs and forged result',()=>{
 const r=play({id:'tamper-test',first:'4A',scenarioId:'S2'});
 const bad=JSON.parse(serializeLiveRun(r));bad.result.metrics.outcome='HOLDS';
 assert.throws(()=>restoreLiveRun(JSON.stringify(bad)),/does not match/);
 const another=JSON.parse(serializeLiveRun(r));another.capital=100;
 assert.throws(()=>restoreLiveRun(JSON.stringify(another)),/does not match/);
});
test('Duplicate action ID is safe only for exact same action',()=>{
 let r=createLiveRun({runId:'idempotence'});
 const a={id:'same',type:'next'},r2=applyLiveAction(r,a);
 assert.equal(applyLiveAction(r2,a),r2);
 assert.throws(()=>applyLiveAction(r2,{id:'same',type:'family',familyId:'care'}),/collision/);
});
