import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePortfolio,responseEligibility} from '../src/causalEngine.js';
import {connectLeaveWell,recoveryProgress,recoveryStorageKey} from '../src/journeyBridge.js';
import {createRecoveryRun,applyRecoveryAction,serializeRun,restoreRun,responseOptions as rwOptions} from '../src/recoverWell/recoveryRun.js';
import {CAPABILITIES as RC} from '../src/recoverWell/recoveryContent.js';
import {recoveryExitPassport} from '../src/recoverWell/recoveryExitPassport.js';
import {createLiveRun,applyLiveAction,serializeLiveRun,restoreLiveRun} from '../src/liveWell/liveRun.js';
import {CAPABILITIES as LC,DESIGNS,responseOptions as lwOptions,makeLiveStart} from '../src/liveWell/liveResolver.js';
import {leaveConsequences,recoveryConsequences,liveConsequences} from '../src/designLegacy.js';
const groups=[
 {name:'Clinical continuity',l:['ambient.shared','meds.pharmacy','meds.huddle','ambient.dedicated'],r:['4A','4C','1A','4B'],v:['3B','2B','2A','4C']},
 {name:'Spatial access',l:['wayfinding.layered','wayfinding.escort','wayfinding.digital','command.liaison'],r:['1B','2B','1C','2C'],v:['1B','1C','4B','3A']},
 {name:'Digital first',l:['ambient.bedside','command.unit','wayfinding.digital','meds.nurse'],r:['3A','3B','2A','1A'],v:['1A','3B','3A','2C']},
 {name:'People & operations',l:['command.center','command.liaison','ambient.dedicated','meds.pharmacy'],r:['4A','4B','4C','1C'],v:['2B','4C','4A','2A']},
 {name:'Balanced',l:['meds.huddle','wayfinding.layered','ambient.shared','command.center'],r:['1B','4A','2B','3C'],v:['1B','3C','4A','2B']}
];
const days=['S1','S2','S3'];
const memory=()=>{let m=new Map();return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
function vote(items,round,table,chapter,slot,ballots){
 assert.ok(items.length);const lead=(round+table*2+chapter+slot)%items.length;
 const picks=[items[lead],items[lead],items[lead],items[(lead+1)%items.length],items[(lead+((round%4===0)?2:1))%items.length]];
 const counts=new Map(items.map(x=>[x,0]));for(const p of picks)counts.set(p,counts.get(p)+1);
 const chosen=[...counts].sort((a,b)=>b[1]-a[1]||items.indexOf(a[0])-items.indexOf(b[0]))[0][0];
 ballots.push({chapter,slot,choices:picks,chosen,majority:Math.max(...counts.values())});return chosen;
}
const states=(a,key)=>Object.fromEntries(['HOLDS','STRAINED','EXPOSED'].map(x=>[x,a.filter(v=>key(v)===x).length]));
function simulate(round,table){
 const p=groups[table],id='sim-'+round+'-'+table,ballots=[],storage=memory();
 const first=vote(p.l,round,table,1,1,ballots),strat=vote(['strengthen','extend'],round,table,1,2,ballots);
 const parse=x=>({capabilityId:x.split('.')[0],commitmentId:x.split('.')[1],strengthened:false});
 const investments=[parse(first)];
 const secondChoices=p.l.filter(x=>x.split('.')[0]!==investments[0].capabilityId);
 if(strat==='extend'&&secondChoices.length)investments.push(parse(vote(secondChoices,round,table,1,3,ballots)));
 else investments[0].strengthened=true;
 const event=days[(round+table)%3],acceptable=['use','adapt','escalate'].filter(r=>responseEligibility({activations:investments},r,event).eligible);
 const leaveResponse=vote(acceptable,round,table,1,4,ballots);
 const details=['route','information','coordination'].map(id=>({id,...evaluatePortfolio({activations:investments},id,leaveResponse)}));
 const outcome=details.some(x=>x.outcome==='EXPOSED')?'EXPOSED':details.some(x=>x.outcome==='STRAINED')?'STRAINED':'HOLDS';
 const team={id:id+'-team',investments,game_state:{evaluation:{model:'causal-composite-readiness-v2',eventId:event,responseId:leaveResponse,outcome,details},responseId:leaveResponse,applied_decisions:{}}};
 const entry=connectLeaveWell({runId:id+'-leave',team,completed:true,completedAt:'2026-11-23T19:00:00Z',experienceMode:'facilitated',sessionId:'sim-session-'+round,sourceReturn:{mode:'host',room:'SIM-'+round,preview:'1'}},{storage,uuid:()=>id+'-journey'});
 let r=createRecoveryRun({handoff:entry.handoff,runId:id+'-recover',policy:'aimedx',scenarioId:days[(round+table*2)%3],lineage:{experienceMode:'facilitated',tableId:team.id,sessionId:'sim-session-'+round}});
 let n=0;const step=(type,fields={})=>{r=applyRecoveryAction(r,{id:id+'-r-'+(++n),type,...fields});assert.ok(r.capital>=0&&r.change>=0)};
 const buy=k=>{const f=RC.find(c=>c.choices.some(x=>x.id===k));step('invest',{capabilityId:f.id});step('next');step('design',{designId:k});step('next')};
 step('next');buy(vote(p.r,round,table,2,1,ballots));
 const strategy=vote(['strengthen','extend'],round,table,2,2,ballots);
 const possible=RC.filter(f=>!r.investments.some(x=>f.choices.some(c=>c.id===x.designId))&&f.cost.capital<=r.capital&&f.cost.change<=r.change);
 if(strategy==='extend'&&possible.length){
  step('strategy',{choice:'extend'});
  const ids=possible.flatMap(f=>f.choices.map(c=>c.id)),preferred=p.r.filter(k=>ids.includes(k));
  buy(vote(preferred.length?preferred:ids,round,table,2,3,ballots));
 }else step('strategy',{choice:'strengthen'});
 step('prediction',{choice:'NOT SURE'});step('revealImpact');step('next');
 const opts=Object.entries(rwOptions(r)).filter(([,x])=>x.eligible&&x.affordable).map(([k])=>k);
 const rwResponse=vote(opts,round,table,2,4,ballots);step('respond',{choice:rwResponse});step('next');step('next');
 assert.equal(r.phase,'journey');storage.setItem(recoveryStorageKey(entry.id),serializeRun(r));
 assert.equal(recoveryProgress(entry,{storage}).run.result.outcome,r.result.outcome);
 assert.equal(restoreRun(serializeRun(r)).phase,'journey');
 const passport=recoveryExitPassport(r);
 let l=createLiveRun({runId:id+'-live',start:makeLiveStart({recoveryPassport:passport}),scenarioId:days[(round+table*2+1)%3],lineage:{experienceMode:'facilitated'}});
 let j=0;const ls=(type,props={})=>{l=applyLiveAction(l,{id:id+'-l-'+(++j),type,...props});assert.ok(l.capital>=0&&l.change>=0)};
 const liveBuy=k=>{ls('family',{familyId:DESIGNS[k].familyId});ls('design',{designId:k})};
 ls('next');liveBuy(vote(p.v,round,table,3,1,ballots));
 const lsStrategy=vote(['strengthen','extend'],round,table,3,2,ballots);
 const avail=LC.filter(f=>f.id!==DESIGNS[l.investments[0].designId].familyId&&f.cost.capital<=l.capital&&f.cost.change<=l.change);
 if(lsStrategy==='extend'&&avail.length){
  ls('strategy',{choice:'extend'});
  const ids=avail.flatMap(f=>f.choices.map(c=>c.id)),pref=p.v.filter(k=>ids.includes(k));
  liveBuy(vote(pref.length?pref:ids,round,table,3,3,ballots));
 }else ls('strategy',{choice:'strengthen'});
 ls('next');
 const responses=Object.entries(lwOptions({investments:l.investments,strategy:l.strategy,scenarioId:l.scenarioId})).filter(([,v])=>v.affordable).map(([k])=>k);
 ls('respond',{choice:vote(responses,round,table,3,4,ballots)});ls('next');ls('next');
 assert.equal(l.phase,'finale');assert.deepEqual(restoreLiveRun(serializeLiveRun(l)),l);
 const lc=leaveConsequences(entry.handoff),rc=recoveryConsequences(r),vc=liveConsequences(passport,l.result);
 assert.ok(lc.title&&rc.title&&vc.why);
 return {round,table:table+1,profile:p.name,players:5,ballots:ballots.length*5,dissent:ballots.reduce((v,x)=>v+5-x.majority,0),
  leave:{outcome,plan:entry.handoff.facts.verifiedTransitionPlan.state,choices:investments.map(x=>x.capabilityId+'.'+x.commitmentId)},
  recover:{outcome:r.result.outcome,scenario:r.scenarioId,choices:r.investments.map(x=>x.designId),used:r.result.path.designIds||[],reconciled:passport.established.contextReconciledInRecovery,capital:r.capital,change:r.change},
  live:{outcome:l.result.metrics.outcome,profile:l.profileId,choices:l.investments.map(x=>x.designId),used:l.result.route.designId,participation:l.result.metrics.participation,future:l.result.metrics.future,benefit:l.result.designLegacy.reduction,backup:l.result.designLegacy.fallbackUsed||null,ordinaryBenefit:l.result.route.designId===null&&l.result.designLegacy.reduction>0,capital:l.capital,change:l.change},
  unused:vc.unused.length,ballotDetails:ballots};
}
test('30 rounds of 5 facilitated tables of 5 simulated players complete all 3 chapters',()=>{
 const runs=[];for(let round=1;round<=30;round++)for(let t=0;t<5;t++)runs.push(simulate(round,t));
 assert.equal(runs.length,150);assert.equal(runs.reduce((a,x)=>a+x.players,0),750);
 const total={rounds:30,tableJourneys:150,playerParticipations:750,ballots:runs.reduce((a,x)=>a+x.ballots,0),dissent:runs.reduce((a,x)=>a+x.dissent,0),
  leave:states(runs,x=>x.leave.outcome),recover:states(runs,x=>x.recover.outcome),live:states(runs,x=>x.live.outcome),
  benefit:runs.filter(x=>x.live.benefit>0).length,backups:runs.filter(x=>x.live.backup).length,ordinaryBenefits:runs.filter(x=>x.live.ordinaryBenefit).length,unusedPurchases:runs.filter(x=>x.unused>0).length};
 console.log('SIM_30_TOTAL '+JSON.stringify(total));
 for(let t=1;t<=5;t++){const a=runs.filter(x=>x.table===t);
  console.log('SIM_30_TABLE '+JSON.stringify({table:t,name:a[0].profile,rounds:a.length,players:150,leave:states(a,x=>x.leave.outcome),recover:states(a,x=>x.recover.outcome),live:states(a,x=>x.live.outcome),
   participation:a.filter(x=>x.live.participation).length,benefit:a.filter(x=>x.live.benefit>0).length,backups:a.filter(x=>x.live.backup).length,ordinaryBenefits:a.filter(x=>x.live.ordinaryBenefit).length,reconciled:a.filter(x=>x.recover.reconciled).length,unused:a.filter(x=>x.unused>0).length,
   leavePortfolios:new Set(a.map(x=>x.leave.choices.join('+'))).size,recoverPortfolios:new Set(a.map(x=>x.recover.choices.join('+'))).size,livePortfolios:new Set(a.map(x=>x.live.choices.join('+'))).size,
   ballots:a.reduce((v,x)=>v+x.ballots,0),dissent:a.reduce((v,x)=>v+x.dissent,0),
   capital:a.reduce((v,x)=>v+x.recover.capital+x.live.capital,0)}));
 }
 for(let round=1;round<=30;round++){const a=runs.filter(x=>x.round===round);console.log('SIM_30_ROUND '+JSON.stringify({round,leave:states(a,x=>x.leave.outcome),recover:states(a,x=>x.recover.outcome),live:states(a,x=>x.live.outcome),benefit:a.filter(x=>x.live.benefit>0).length}));}
});
