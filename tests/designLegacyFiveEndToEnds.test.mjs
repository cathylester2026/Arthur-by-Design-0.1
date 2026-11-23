import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePortfolio} from '../src/causalEngine.js';
import {connectLeaveWell,getJourney,recoveryProgress,recoveryStorageKey} from '../src/journeyBridge.js';
import {createRecoveryRun,applyRecoveryAction,serializeRun,restoreRun,responseOptions} from '../src/recoverWell/recoveryRun.js';
import {recoveryExitPassport} from '../src/recoverWell/recoveryExitPassport.js';
import {createLiveRun,applyLiveAction,serializeLiveRun,restoreLiveRun} from '../src/liveWell/liveRun.js';
import {makeLiveStart,DESIGNS} from '../src/liveWell/liveResolver.js';
import {leaveLegacy,recoveryLegacy,liveDesignReadiness,leaveConsequences,recoveryConsequences,liveConsequences} from '../src/designLegacy.js';

const cases=[
 {name:'01-strong-verified-transition',lw:[['ambient','shared'],['meds','pharmacy']],rw:'4A',rwScenario:'S2',rwResponse:'use',live:'3B',liveScenario:'S2',liveResponse:'use', intent:'Verified information should help only when a new qualified receiver can use it.'},
 {name:'02-open-handoff-reconstruction',lw:[['wayfinding','layered'],['meds','nurse']],rw:'4A',rwScenario:'S2',rwResponse:'adapt',live:'3B',liveScenario:'S2',liveResponse:'use',intent:'Earlier gap remains historical even if the next chapter reconstructs clinical context.'},
 {name:'03-technology-outage',lw:[['command','center']],lwStrength:true,rw:'2C',rwScenario:'S3',rwResponse:'use',live:'1A',liveScenario:'S1',liveResponse:'use',intent:'A selected robot should not create a community accessible route.'},
 {name:'04-human-service-ordinary-care',lw:[['ambient','bedside']],lwStrength:true,rw:'4A',rwScenario:'S2',rwResponse:'ordinary',live:'2B',liveScenario:'S2',liveResponse:'ordinary',intent:'Ordinary qualified care may be more important than a purchased tool.'},
 {name:'05-balanced-spatial-community',lw:[['meds','huddle'],['wayfinding','layered']],rw:'1B',rwScenario:'S1',rwResponse:'use',live:'1B',liveScenario:'S1',liveResponse:'use',intent:'Hospital movement cannot create home space or a community detour.'}
];
const store=()=>{const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}};
function leavePlay(c,n){
 const investments=c.lw.map(([capabilityId,commitmentId])=>({capabilityId,commitmentId,strengthened:!!c.lwStrength}));
 const details=['route','information','coordination'].map(id=>({id,...evaluatePortfolio({activations:investments},id,'use')}));
 const outcome=details.some(x=>x.outcome==='EXPOSED')?'EXPOSED':details.some(x=>x.outcome==='STRAINED')?'STRAINED':'HOLDS';
 return {id:'legacy-table-'+n,investments,game_state:{evaluation:{model:'causal-composite-readiness-v2',eventId:'handoff_changed',responseId:'use',outcome,details},responseId:'use',applied_decisions:{}}};
}
function play(c,n){
 const storage=store(),team=leavePlay(c,n),prefix='legacy-'+n;
 const entry=connectLeaveWell({runId:prefix+'-leave',team,completed:true,completedAt:'2026-11-23T17:00:00Z',experienceMode:'independent',sourceReturn:{mode:'studio-solo',preview:'1'}},{storage,uuid:()=>prefix+'-journey'});
 assert.equal(getJourney(entry.id,{storage}).id,entry.id);
 const leave=leaveLegacy(entry.handoff);
 const leaveImpact=leaveConsequences(entry.handoff);
 assert.ok(leaveImpact.title&&leaveImpact.difference);

 const recoveryRunId=prefix+'-recover';
 let r=createRecoveryRun({handoff:entry.handoff,runId:recoveryRunId,policy:'aimedx',scenarioId:c.rwScenario});
 let action=0;
 const rec=(type,opts={})=>{r=applyRecoveryAction(r,{id:prefix+'-r-'+(++action),type,...opts});assert.ok(r.capital>=0&&r.change>=0);return r};
 rec('next');
 rec('invest',{capabilityId:{'1':'personalized','2':'rehab','3':'warning','4':'response'}[c.rw[0]]});
 rec('next');rec('design',{designId:c.rw});rec('next');
 rec('strategy',{choice:'strengthen'});
 rec('prediction',{choice:'NOT SURE'});rec('revealImpact');rec('next');
 const available=responseOptions(r);
 assert.ok(available[c.rwResponse].eligible&&available[c.rwResponse].affordable,'Recovery response unavailable '+c.name);
 rec('respond',{choice:c.rwResponse});
 assert.equal(r.phase,'result');rec('next');rec('next');
 assert.equal(r.phase,'journey');
 storage.setItem(recoveryStorageKey(entry.id),serializeRun(r));
 assert.equal(recoveryProgress(entry,{storage}).run.result.outcome,r.result.outcome);
 assert.equal(restoreRun(serializeRun(r)).phase,'journey');
 const recover=recoveryLegacy(r),passport=recoveryExitPassport(r);
 const recoveryImpact=recoveryConsequences(r);
 assert.ok(recoveryImpact.title&&recoveryImpact.needs&&recoveryImpact.carryToLive);
 assert.equal(recoveryImpact.originalPlanState,entry.handoff.facts.verifiedTransitionPlan.state);
 if(passport.established.contextReconciledInRecovery){
   assert.equal(recoveryImpact.repaired,true);
   assert.ok(recoveryImpact.needs.includes('original discharge gap')||recoveryImpact.needs.includes('discharge'));
 }

 const start=makeLiveStart({recoveryPassport:passport});
 assert.equal(start.resources.capital,7);
 assert.equal(start.resources.change,6);
 let l=createLiveRun({runId:prefix+'-live',start,scenarioId:c.liveScenario});
 let k=0;const lv=(type,opts={})=>{l=applyLiveAction(l,{id:prefix+'-l-'+(++k),type,...opts});assert.ok(l.capital>=0&&l.change>=0);return l};
 lv('next');lv('family',{familyId:DESIGNS[c.live].familyId});lv('design',{designId:c.live});lv('strategy',{choice:'strengthen'});
 lv('next');lv('respond',{choice:c.liveResponse});lv('next');lv('next');
 assert.equal(l.phase,'finale');
 assert.deepEqual(restoreLiveRun(serializeLiveRun(l)),l);
 assert.equal(l.result.priorRecovery.runId,recoveryRunId);
 assert.equal(l.result.designLegacy.recoveryRunId,recoveryRunId);
 assert.equal(l.result.designLegacy.leaveWellRunId,prefix+'-leave');
 const decision=liveDesignReadiness(passport,c.live);
 const liveImpact=liveConsequences(passport,l.result);
 assert.equal(liveImpact.burdenReduction,l.result.designLegacy.reduction);
 assert.ok(liveImpact.why&&liveImpact.needs);
 if(l.result.route.designId===null)assert.equal(liveImpact.used,null);
 if(liveImpact.used)assert.ok(l.investments.some(x=>x.designId===liveImpact.used));

 const summary={
  name:c.name,intent:c.intent,
  LeaveWell:{outcome:team.game_state.evaluation.outcome,investments:team.investments.map(x=>x.capabilityId+':'+x.commitmentId),plan:entry.handoff.facts.verifiedTransitionPlan.state,established:leave.established.map(x=>x.id+':'+x.state)},
  RecoverWell:{impact:recoveryImpact.title,repairEffort:recoveryImpact.repairEffort,outcome:r.result.outcome,path:r.result.path.id,investments:r.investments.map(x=>x.designId),used:r.result.path.designIds,remaining:{capital:r.capital,change:r.change},usableClinicalContext:passport.established.priorClinicalContextUsable,reconciled:passport.established.contextReconciledInRecovery,gaps:passport.dependencies.unresolved},
  LiveWell:{impact:liveImpact.title,why:liveImpact.why,used:liveImpact.used,unused:liveImpact.unused,outcome:l.result.metrics.outcome,future:l.result.metrics.future,participation:l.result.metrics.participation,route:l.result.route.id,design:c.live,readiness:decision.state,legacy:l.result.designLegacy.status,burdenReduction:l.result.designLegacy.reduction,remaining:l.result.remaining}
 };
 console.log('DESIGN_LEGACY_FIVE_END_TO_END '+JSON.stringify(summary));
 return summary;
}
test('Five completed Leave Well -> journey map -> Recover Well -> journey map -> Live Well paths preserve evidence and save states',()=>{
 const results=cases.map(play);
 assert.equal(results.length,5);
 assert.equal(new Set(results.map(x=>x.RecoverWell.path)).size>=3,true);
 assert.ok(results.some(x=>x.LeaveWell.plan==='established')&&results.some(x=>x.LeaveWell.plan!=='established'));
 assert.ok(results.every(x=>x.LiveWell.legacy));
 assert.match(results[0].LiveWell.why,/earlier usable care information/i);
 assert.match(results[1].LiveWell.why,/had to reconcile clinical information/i);
 assert.notEqual(results[0].LiveWell.why,results[1].LiveWell.why);
 assert.equal(results[2].LiveWell.used,null,'The unverified community route must not credit the AI purchase');
 assert.ok(results[2].LiveWell.unused.includes('1A'));
 assert.equal(results[3].LiveWell.used,null,'Ordinary care must not credit purchased clinical network');
 assert.ok(results.every(x=>x.RecoverWell.remaining.capital>=0&&x.RecoverWell.remaining.change>=0));

});
