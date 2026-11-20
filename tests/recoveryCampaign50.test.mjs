import test from 'node:test';
import assert from 'node:assert/strict';
import {causalChoices,evaluatePortfolio,responseEligibility} from '../src/causalEngine.js';
import {connectLeaveWell,getJourney,recoveryProgress} from '../src/journeyBridge.js';
import {createRecoveryRun,applyRecoveryAction,responseOptions,serializeRun,restoreRun} from '../src/recoverWell/recoveryRun.js';
import {CAPABILITIES,CHOICES,COSTS} from '../src/recoverWell/recoveryContent.js';
import {standaloneHandoff} from '../src/recoverWell/leaveWellHandoff.js';
import {recoveryResponseOptions,resolveRecovery} from '../src/recoverWell/recoveryResolver.js';
import {recoveryInvestmentLedger} from '../src/recoverWell/recoveryInvestmentLedger.js';
import {recoveryExitPassport} from '../src/recoverWell/recoveryExitPassport.js';

const picks=Object.entries(causalChoices).flatMap(([cap,opts])=>Object.keys(opts).map(choice=>[cap,choice]));
const designs=CAPABILITIES.flatMap(c=>c.choices.map(d=>d.id));
const family=id=>CAPABILITIES.find(c=>c.choices.some(d=>d.id===id));
const cases=[];
for(let n=0;n<50;n++){
 const a=picks[(n*7+3)%picks.length],b=picks[(n*5+1)%picks.length];
 const lw=[a];if(n%5!==0){const other=a[0]===b[0]?picks.find((p,i)=>i>n%3&&p[0]!==a[0]):b;lw.push(other);}
 const event=['S1','S2','S3'][n%3],strategy=n%2===0?'strengthen':'extend';
 const first=designs[(n*5+Math.floor(n/12))%designs.length],others=designs.filter(id=>id[0]!==first[0]);
 const second=others[(n*7+Math.floor(n/10))%others.length];
 const proposed=['use','adapt','ordinary','escalate'][(n+Math.floor(n/7))%4];
 cases.push({n,lw,first,second,strategy,event,proposed,seed:n});
}
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const next=(run,type,details,id)=>applyRecoveryAction(run,{id:'qa-'+id,type,...details});
function hospital(c){
 const investments=c.lw.map(([capabilityId,commitmentId])=>({capabilityId,commitmentId,strengthened:c.lw.length===1}));
 const activations=investments.map(x=>({...x}));
 const eventId=['route','information','coordination'][c.n%3];
 const candidates=['use','adapt','escalate'];
 const valid=candidates.filter(x=>responseEligibility({activations},x,eventId).eligible);
 const responseId=valid[(c.n+1)%valid.length];
 const details=['route','information','coordination'].map(id=>({id,...evaluatePortfolio({activations},id,responseId)}));
 const evaluation={model:'causal-composite-readiness-v2',eventId,responseId,outcome:details.some(x=>x.outcome==='EXPOSED')?'EXPOSED':details.some(x=>x.outcome==='STRAINED')?'STRAINED':'HOLDS',details};
 return {id:'qa-table-'+c.n,investments,game_state:{evaluation,responseId,applied_decisions:{}}};
}
function play(c){
 const storage=memory(),team=hospital(c);
 const entry=connectLeaveWell({runId:'qa-leave-'+c.n,team,completed:true,completedAt:'2026-11-20T00:00:00Z',experienceMode:'independent',sourceReturn:{mode:'studio-solo',preview:'1'}},{storage,uuid:()=> 'qa-journey-'+c.n});
 assert.equal(getJourney(entry.id,{storage}).sourceFingerprint,entry.sourceFingerprint);
 let r=createRecoveryRun({handoff:entry.handoff,runId:'qa-recovery-'+c.n,policy:'aimedx',scenarioId:c.event});
 let k=0;
 const act=(type,details={})=>{r=next(r,type,details,c.n+'-'+(++k));assert.ok(r.capital>=0&&r.change>=0);return r};
 const buy=id=>{act('invest',{capabilityId:family(id).id});act('next');act('design',{designId:id});act('next')};
 act('next');buy(c.first);
 if(c.strategy==='strengthen')act('strategy',{choice:'strengthen'});
 else{act('strategy',{choice:'extend'});buy(c.second);}
 assert.equal(r.phase,'event');
 if(c.first==='2A'&&c.second==='3C'&&c.strategy==='extend')act('shareMovement',{value:true});
 act('prediction',{choice:['YES','NOT SURE','NO'][c.n%3]});
 act('revealImpact');assert.equal(r.phase,'impact');
 const originalBaseline=r.baseline;
 act('next');assert.equal(r.phase,'respond');
 const all=responseOptions(r),available=Object.keys(all).filter(id=>all[id].eligible&&all[id].affordable);
 assert.ok(available.length>0,'No available response: '+c.n);
 const chosen=available.includes(c.proposed)?c.proposed:available[(c.n+1)%available.length];
 act('respond',{choice:chosen});
 assert.equal(r.phase,'result');
 assert.ok(['HOLDS','STRAINED','EXPOSED'].includes(r.result.outcome));
 assert.ok(r.result.path);
 assert.deepEqual(r.baseline,originalBaseline);
 const ledger=recoveryInvestmentLedger(r.investments,r.result,r.baseline);
 assert.equal(ledger.length,r.investments.length);
 for(const item of ledger)if(item.used)assert.ok(r.result.path.complete,'Used claim for incomplete event');
 const saved=serializeRun(r),restored=restoreRun(saved);
 assert.equal(restored.result.outcome,r.result.outcome);
 storage.setItem('arthur-recover-connected-r6:'+entry.id,saved);
 const progress=recoveryProgress(entry,{storage});
 assert.equal(progress.error,null,'Connected replay error '+c.n);
 assert.equal(progress.run?.result?.outcome,r.result.outcome,'Connected replay incorrect '+c.n);
 assert.equal(recoveryExitPassport(r).dependencies.nextStepEstablished,r.result.outcome!=='EXPOSED');
 const duplicate={id:r.actions.at(-1).id,type:'respond',choice:chosen};
 assert.deepEqual(applyRecoveryAction(r,duplicate),r,'Idempotence after resume');
 assert.throws(()=>applyRecoveryAction(r,{...duplicate,choice:'invalid'}),/reused/);
 act('next');assert.equal(r.phase,'chapterClose');
 act('next');assert.equal(r.phase,'journey');
 assert.equal(restoreRun(serializeRun(r)).phase,'journey');
 return {lw:team.game_state.evaluation.outcome,plan:entry.handoff.facts.verifiedTransitionPlan.state,strategy:c.strategy,event:c.event,proposed:c.proposed,actual:chosen,portfolio:r.investments.map(i=>i.designId).join('+'),outcome:r.result.outcome,route:r.result.path.id,budget:[r.capital,r.change],strengthUses:r.result.strengthUses.length};
}
test('50 deterministic varied linked Leave Well -> Recover Well journeys, save/resume, and completion',()=>{
 const results=cases.map(play);
 assert.equal(results.length,50);
 assert.equal(new Set(results.map(r=>r.event)).size,3);
 assert.equal(new Set(results.map(r=>r.portfolio)).size>=15,true,'Insufficient portfolio variation');
 assert.equal(new Set(results.map(r=>r.actual)).size>=3,true,'Insufficient response variation');
 assert.ok(results.some(r=>r.strategy==='extend')&&results.some(r=>r.strategy==='strengthen'));
 console.log('QA_50_RESULTS '+JSON.stringify({runs:results.length,scenarioCount:Object.fromEntries(['S1','S2','S3'].map(k=>[k,results.filter(x=>x.event===k).length])),responseCount:Object.fromEntries(['use','adapt','ordinary','escalate'].map(k=>[k,results.filter(x=>x.actual===k).length])),outcomes:Object.fromEntries(['HOLDS','STRAINED','EXPOSED'].map(k=>[k,results.filter(x=>x.outcome===k).length])),strategyCount:Object.fromEntries(['strengthen','extend'].map(k=>[k,results.filter(x=>x.strategy===k).length])),uniquePortfolios:new Set(results.map(x=>x.portfolio)).size,actualCases:results}));
});

const portfolios=[];
for(const id of designs)portfolios.push([{designId:id,strengthened:true}]);
for(let i=0;i<designs.length;i++)for(let j=i+1;j<designs.length;j++)if(designs[i][0]!==designs[j][0]){
 const first=family(designs[i]),second=family(designs[j]);
 const costC=first.cost.capital+second.cost.capital, costX=first.cost.change+second.cost.change;
 if(costC<=7&&costX<=6)portfolios.push([{designId:designs[i],strengthened:false},{designId:designs[j],strengthened:false}]);
}
test('Exhaustive legal Strengthen/Extend portfolios across disruptions and both discharge contexts',()=>{
 let checked=0,responses=0;
 for(const preset of ['supported','open'])for(const scenarioId of ['S1','S2','S3'])for(const investments of portfolios){
  const cost=investments.reduce((sum,i)=>({capital:sum.capital+family(i.designId).cost.capital,change:sum.change+family(i.designId).cost.change}),{capital:investments.length===1?1:0,change:investments.length===1?1:0});
  const budget={capital:7-cost.capital,change:6-cost.change};
  const base={handoff:standaloneHandoff(preset),investments,scenarioId};
  const opts=recoveryResponseOptions(base);
  const available=Object.entries(opts).filter(([key,o])=>o.eligible&&budget.capital>=COSTS[key].capital&&budget.change>=COSTS[key].change);
  assert.ok(available.length>0,'No response possible '+preset+' '+scenarioId+' '+investments.map(i=>i.designId));
  assert.ok(available.some(([key])=>key==='ordinary'),'Ordinary help missing');
  const baseline=resolveRecovery({...base,response:'use'});
  for(const [response] of available){
   const v=resolveRecovery({...base,response});
   assert.ok(['HOLDS','STRAINED','EXPOSED'].includes(v.outcome));
   assert.ok(v.path&&v.chain.length>=3);
   assert.ok(v.outcome!=='HOLDS'||v.path.complete,'HOLDS without established response');
   const ledger=recoveryInvestmentLedger(investments,v,baseline);
   for(const item of ledger)if(item.used)assert.equal(v.path.complete,true);
   responses++;
  }
  checked++;
 }
 console.log('QA_EXHAUSTIVE_RESULTS '+JSON.stringify({portfolios:portfolios.length,cases:checked,eligibleResponses:responses,disruptions:3,handoffs:2}));
});
