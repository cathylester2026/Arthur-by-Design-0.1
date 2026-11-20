import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePortfolio,responseEligibility} from '../src/causalEngine.js';
import {createLeaveWellHandoff} from '../src/recoverWell/leaveWellHandoff.js';
import {connectLeaveWell,getJourney,recoveryProgress} from '../src/journeyBridge.js';
import {createRecoveryRun,applyRecoveryAction,responseOptions,serializeRun,restoreRun} from '../src/recoverWell/recoveryRun.js';
import {recoveryExitPassport} from '../src/recoverWell/recoveryExitPassport.js';

const cases=[
 {name:'verified-clinical-funding',lw:[['ambient','shared'],['meds','pharmacy']],lwResponse:'use',rw:'4A',strategy:'strengthen',scenario:'S2',response:'use'},
 {name:'unresolved-plan-repaired',lw:[['wayfinding','layered'],['meds','nurse']],lwResponse:'use',rw:'4A',strategy:'strengthen',scenario:'S2',response:'adapt'},
 {name:'robot-outage-deferral',lw:[['command','center']],lwResponse:'use',lwStrength:true,rw:'2C',strategy:'strengthen',scenario:'S3',response:'use'},
 {name:'ordinary-care-with-sensors',lw:[['ambient','bedside']],lwResponse:'use',lwStrength:true,rw:'3A',strategy:'strengthen',scenario:'S2',response:'ordinary'},
 {name:'home-routine-after-information-gap',lw:[['meds','huddle'],['wayfinding','layered']],lwResponse:'use',rw:'1B',strategy:'strengthen',scenario:'S1',response:'use'}
];
const changed={route:'Movement and departure',information:'Current plan',coordination:'Handoff ownership'};
const store=()=>{const memory=new Map();return {getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key)}};
const runLW=(c,index)=>{
 const investments=c.lw.map(([capabilityId,commitmentId])=>({capabilityId,commitmentId,strengthened:!!c.lwStrength}));
 const activations=investments;
 const details=['route','information','coordination'].map(id=>{
  const v=evaluatePortfolio({activations},id,c.lwResponse);
  return {id,label:changed[id],...v};
 });
 const info=details.find(d=>d.id==='information');
 const evaluation={model:'causal-composite-readiness-v2',eventId:'handoff_changed',responseId:c.lwResponse,outcome:details.some(x=>x.outcome==='EXPOSED')?'EXPOSED':details.some(x=>x.outcome==='STRAINED')?'STRAINED':'HOLDS',details};
 return {id:'table-'+index,investments,game_state:{evaluation,responseId:c.lwResponse,applied_decisions:{}}};
};
const next=(r,type,fields,n)=>applyRecoveryAction(r,{id:'evt-'+n,type,...fields});
function play(c,i){
 const team=runLW(c,i);
 const storage=store();
 const entry=connectLeaveWell({runId:'full-journey-'+i,team,completed:true,completedAt:'2026-11-20T16:00:00Z',experienceMode:'independent',sourceReturn:{mode:'studio-solo',preview:'1'}},{storage,uuid:()=> 'journey-'+i});
 assert.equal(entry.handoff.source.kind,'leave-well');
 assert.equal(getJourney(entry.id,{storage}).sourceFingerprint,entry.sourceFingerprint);
 let r=createRecoveryRun({handoff:entry.handoff,runId:'recovery-'+i,policy:'aimedx',scenarioId:c.scenario});
 const visited=[r.phase]; let n=1;
 const act=(type,fields={})=>{r=next(r,type,fields,n++);visited.push(r.phase);return r};
 const invest=id=>{const family={'1':'personalized','2':'rehab','3':'warning','4':'response'}[id[0]];act('invest',{capabilityId:family});act('next');act('design',{designId:id});act('next')};
 act('next');invest(c.rw);
 if(c.strategy==='strengthen')act('strategy',{choice:'strengthen'});
 else throw Error('Case must define a strategy');
 assert.equal(r.phase,'event');
 act('prediction',{choice:'NOT SURE'});
 act('revealImpact');act('next');
 const options=responseOptions(r);
 assert.ok(options[c.response].eligible&&options[c.response].affordable,c.name+': response '+c.response+' ineligible');
 act('respond',{choice:c.response});
 const resulting=r.result.outcome,notes={name:c.name,LeaveWell:team.game_state.evaluation.outcome,plan:entry.handoff.facts.verifiedTransitionPlan.state,RecoverWell:resulting,response:c.response,route:r.result.path.id,strengthening:r.result.strengthUses.length,capital:r.capital,change:r.change};
 assert.equal(r.phase,'result');
 const back=restoreRun(serializeRun(r));
 assert.equal(back.result.outcome,resulting);
 const passport=recoveryExitPassport(r);
 assert.equal(passport.dependencies.nextStepEstablished,resulting!=='EXPOSED');
 act('next');assert.equal(r.phase,'chapterClose');
 act('next');assert.equal(r.phase,'journey');
 assert.equal(restoreRun(serializeRun(r)).phase,'journey');
 assert.deepEqual(visited.slice(0,7),['brief','invest','activation','design','designReveal','strategy','event']);
 console.log('CONNECTED FIVE-PLAY SUMMARY '+JSON.stringify(notes));
 return {notes,visited};
}
test('Five real Leave Well engine to bridge to Recover Well decision and result journeys complete',()=>{
 const results=cases.map(play);
 assert.equal(results.length,5);
 assert.equal(new Set(results.map(r=>r.notes.route)).size>=3,true);
});
