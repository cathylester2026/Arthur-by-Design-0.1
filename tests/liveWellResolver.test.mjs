import test from 'node:test';
import assert from 'node:assert/strict';
import {CAPITAL,CHANGE,DESIGNS,SCENARIOS,legalPortfolios,validatePortfolio,makeLiveStart,validateRecoveryPassport,eventFacts,responseOptions,evaluateLiveWell} from '../src/liveWell/liveResolver.js';
import {recoveryExitPassport} from '../src/recoverWell/recoveryExitPassport.js';
import {createRecoveryRun,applyRecoveryAction} from '../src/recoverWell/recoveryRun.js';
import {standaloneHandoff} from '../src/recoverWell/leaveWellHandoff.js';

const start=makeLiveStart();
const cases=legalPortfolios();
const run=(designId,scenarioId,overrides={},strategy='strengthen',response='use',extra={})=>evaluateLiveWell({start,investments:[{designId,strengthened:true}],strategy,scenarioId,facts:overrides,response,...extra});
test('Four investment families, 12 unique designs, legal Strengthen/Extend and budgets',()=>{
 assert.equal(Object.keys(DESIGNS).length,12);
 assert.equal(new Set(Object.values(DESIGNS).map(x=>x.familyId)).size,4);
 assert.equal(cases.filter(x=>x.strategy==='strengthen').length,12);
 assert.ok(cases.some(x=>x.strategy==='extend'));
 for(const p of cases){const b=validatePortfolio(p);assert.ok(b.remaining.capital>=0&&b.remaining.change>=0);}
 assert.throws(()=>validatePortfolio({strategy:'extend',investments:[{designId:'1A'},{designId:'1B'}]}),/different/);
 assert.throws(()=>validatePortfolio({strategy:'strengthen',investments:[{designId:'1A'},{designId:'2B'}]}),/Investment count/);
 assert.throws(()=>validatePortfolio({strategy:'strengthen',investments:[{designId:'6Z'}]}),/Unknown/);
 assert.throws(()=>validatePortfolio({strategy:'extend',investments:[{designId:'2A'},{designId:'2B'}]}),/different/);
});

test('All legal portfolios × disruptions × available response actions finish with meaningful bounded result and valid accounting',()=>{
 let count=0, successes=0, setbacks=0, failures=0;
 for(const p of cases)for(const s of Object.keys(SCENARIOS)){
  const options=responseOptions({...p,scenarioId:s});
  assert.equal(options.ordinary.affordable,true);
  for(const [response,choice]of Object.entries(options)){
   if(!choice.affordable)continue;
   const v=evaluateLiveWell({...p,start,scenarioId:s,response});
   count++;
   assert.equal(v.spent.capital+v.remaining.capital,CAPITAL);
   assert.equal(v.spent.change+v.remaining.change,CHANGE);
   assert.ok(v.route?.reason);
   assert.ok(['HOLDS','STRAINED','EXPOSED'].includes(v.metrics.outcome));
   assert.ok(['FRAGMENTED','CONNECTED_FRAGILE','ADAPTABLE_ACCOUNTABLE'].includes(v.metrics.future));
   assert.ok(['high','medium','low'].includes(v.metrics.agency));
   assert.ok(v.metrics.burden>=0);
   assert.equal(v.priorRecovery,null);
   assert.equal(v.metrics.outcome==='HOLDS',v.metrics.participation);
   if(v.route.contributedStrength)assert.equal(p.strategy,'strengthen');
   if(response==='ordinary')assert.equal(v.route.designId,null);
   if(v.metrics.outcome==='HOLDS')successes++;
   if(v.metrics.outcome==='STRAINED')setbacks++;
   if(v.metrics.outcome==='EXPOSED')failures++;
  }
 }
 assert.ok(count>=600);
 assert.ok(successes>0&&setbacks>0);
 console.log('LIVE_MATRIX '+JSON.stringify({portfolios:cases.length,scenarios:Object.keys(SCENARIOS).length,evaluatedResponses:count,outcomes:{HOLDS:successes,STRAINED:setbacks,EXPOSED:failures}}));
});

test('No clinical false success without qualified accepted timely assessment',()=>{
 for(const p of cases)for(const response of ['use','adapt','coordinate','ordinary']){
  const opts=responseOptions({...p,scenarioId:'S2'});
  if(!opts[response].affordable)continue;
  const v=evaluateLiveWell({...p,start,scenarioId:'S2',response,facts:{assessmentAccepted:false,podClinicianAccepted:false,referralAccepted:false,mobileServiceAccepted:false,remoteAdviceAccepted:false}});
  assert.equal(v.metrics.outcome,'EXPOSED',p.investments[0].designId+' '+response);
  assert.equal(v.metrics.safetyEstablished,false);
  assert.equal(v.metrics.participation,false);
 }
});

test('Access and physical obstructions cannot be fixed by invented AI or concierge capacity',()=>{
 const blocked={alternativeRouteExists:false,alternativeRouteAccessible:false,accessibleTransportAvailable:false,transportRequestAccepted:false,assistanceAccepted:false};
 for(const id of ['1A','1B','1C','3A','3B','4C']){
  const v=run(id,'S1',blocked);
  assert.notEqual(v.metrics.outcome,'HOLDS',id);
  assert.equal(v.metrics.participation,false);
 }
 for(const id of ['1A','1B','1C','3C','4B','4C']){
  const v=run(id,'S3',{alternateVenueConfirmed:false,remoteParticipationAccepted:false,usableTravelAvailable:false});
  assert.notEqual(v.metrics.outcome,'HOLDS',id);
 }
});

test('Relevant real capabilities can hold in bounded verified scenarios',()=>{
 const route=run('1B','S1',{alternativeRouteVerified:true});
 assert.equal(route.metrics.outcome,'HOLDS');
 const transport=run('1C','S1',{transportRequestAccepted:true});
 assert.equal(transport.metrics.outcome,'HOLDS');
 const pod=run('2A','S2',{podClinicianAccepted:true});
 assert.equal(pod.metrics.outcome,'HOLDS');
 const network=run('2B','S2',{referralAccepted:true,referralCapacity:true});
 assert.equal(network.metrics.outcome,'HOLDS');
 const mobile=run('2C','S2',{mobileServiceAccepted:true,mobileServiceCapacity:true});
 assert.equal(mobile.metrics.outcome,'HOLDS');
 const event=run('4B','S3',{communityHubConfirmed:true});
 assert.equal(event.metrics.outcome,'HOLDS');
 const remote=run('3C','S3',{remoteParticipationAccepted:true});
 assert.equal(remote.metrics.outcome,'HOLDS');
});

test('Strengthen is contextual and cannot create missing capacity',()=>{
 const p={strategy:'strengthen',investments:[{designId:'1B',strengthened:true}]};
 const unverified=evaluateLiveWell({...p,start,scenarioId:'S1'});
 const verified=evaluateLiveWell({...p,start,scenarioId:'S1',facts:{physicalWayfindingAvailable:true}});
 assert.equal(unverified.metrics.outcome,'HOLDS'); // Physical signed detour actually exists in the default situation
 assert.equal(verified.metrics.outcome,'HOLDS');
 const blocked=evaluateLiveWell({...p,start,scenarioId:'S1',facts:{alternativeRouteAccessible:false}});
 assert.equal(blocked.metrics.participation,false);
 const noPodClinician=run('2A','S2',{podClinicianAccepted:false});
 assert.equal(noPodClinician.metrics.participation,false);
 const withPodClinician=run('2A','S2',{podClinicianAccepted:true});
 assert.equal(withPodClinician.metrics.participation,true);
});

test('Invalid fact overrides and unaffordable response are rejected, ordinary path always exists',()=>{
 assert.throws(()=>eventFacts('S1',{fictionalCapacity:true}),/Unknown/);
 assert.throws(()=>eventFacts('S2',{assessmentAccepted:'yes'}),/invalid/);
 assert.throws(()=>evaluateLiveWell({start,scenarioId:'S3',strategy:'strengthen',investments:[{designId:'2A',strengthened:true}],response:'fiction'}),/Unknown/);
 const p=cases.find(x=>x.strategy==='extend'&&validatePortfolio(x).remaining.change===1);
 assert.ok(p);
 assert.equal(responseOptions({...p,scenarioId:'S1',budget:{capital:0,change:0}}).coordinate.affordable,false);
 assert.equal(responseOptions({...p,scenarioId:'S1'}).coordinate.affordable,true);
 const ordinary=evaluateLiveWell({...p,start,scenarioId:'S1',response:'ordinary'});
 assert.equal(ordinary.metrics.outcome,'STRAINED');
});

test('Valid completed Recover Well exit passport is carried as evidence, never automatic care capacity',()=>{
 let r=createRecoveryRun({runId:'rw-live-carryover',handoff:standaloneHandoff('supported'),scenarioId:'S2'});
 const actions=[['next',{}],['invest',{capabilityId:'response'}],['next',{}],['design',{designId:'4A'}],['next',{}],['strategy',{choice:'strengthen'}],['revealImpact',{}],['next',{}],['respond',{choice:'use'}]];
 actions.forEach(([type,properties],i)=>r=applyRecoveryAction(r,{id:'live-'+i,type,...properties}));
 const passport=recoveryExitPassport(r),connected=makeLiveStart({recoveryPassport:passport});
 assert.equal(connected.source,'connected');
 assert.equal(connected.linkedRecovery.source.runId,r.runId);
 assert.equal(connected.resources.capital,CAPITAL);
 assert.equal(connected.resources.change,CHANGE);
 const v=evaluateLiveWell({start:connected,scenarioId:'S2',strategy:'strengthen',investments:[{designId:'2A',strengthened:true}],response:'use',facts:{assessmentAccepted:false,podClinicianAccepted:false}});
 assert.equal(v.priorRecovery.runId,r.runId);
 assert.equal(v.metrics.outcome,'EXPOSED','A prior successful recovery route cannot create future qualified assessment');
 assert.equal(v.remaining.capital,3);
 const tampered=structuredClone(passport);tampered.dependencies.continuingCommunityServiceAccepted=true;
 assert.throws(()=>makeLiveStart({recoveryPassport:tampered}),/cannot establish/);
 assert.throws(()=>makeLiveStart({recoveryPassport:{schema:'rw.exit.v1'}}),/validated/);
 const altered=structuredClone(connected);altered.resources.capital=100;
 assert.throws(()=>evaluateLiveWell({start:altered,scenarioId:'S1',strategy:'strengthen',investments:[{designId:'1B',strengthened:true}]}),/Prior chapter resources/);
});

test('Autonomous delivery reduces effort only for real orders and cannot substitute for clinical assessment',()=>{
 assert.equal(run('4A','S1').metrics.participation,false);
 assert.equal(run('4A','S3').metrics.participation,false);
 const yes=run('4A','S2',{agreedPlanForReturningHome:true});
 assert.equal(yes.metrics.participation,false);
 assert.equal(yes.route.id,'delivery-preserves-energy');
 const no=run('4A','S2',{deliveryServiceAvailable:false,agreedPlanForReturningHome:true});
 assert.notEqual(no.route.id,'delivery-preserves-energy');
});

test('Clinical assessment may succeed while Arthur appropriately does not resume the gathering',()=>{
 const v=run('2A','S2',{podClinicianAccepted:true,communityReturnPossible:false});
 assert.equal(v.metrics.safetyEstablished,true);
 assert.equal(v.metrics.participation,false);
 assert.equal(v.metrics.outcome,'STRAINED');
 assert.notEqual(v.metrics.future,'ADAPTABLE_ACCOUNTABLE');
});

test('Adapt and Coordinate produce a real new path only when the relevant alternative is confirmed',()=>{
 const route={strategy:'strengthen',investments:[{designId:'1A',strengthened:true}],start,scenarioId:'S1'};
 const no= evaluateLiveWell({...route,response:'adapt',facts:{alternativeRouteVerified:false,physicalWayfindingAvailable:false}});
 const yes=evaluateLiveWell({...route,response:'adapt',facts:{alternativeRouteVerified:false,physicalWayfindingAvailable:false,adaptedDetourVerified:true}});
 assert.notEqual(no.metrics.outcome,'HOLDS');
 assert.equal(yes.metrics.outcome,'HOLDS');
 assert.equal(yes.route.id,'verified-local-detour');
 const ride={strategy:'strengthen',investments:[{designId:'1C',strengthened:true}],start,scenarioId:'S1'};
 assert.notEqual(evaluateLiveWell({...ride,response:'use'}).metrics.outcome,'HOLDS');
 const accepted=evaluateLiveWell({...ride,response:'coordinate',facts:{coordinatedTransportAccepted:true}});
 assert.equal(accepted.metrics.outcome,'HOLDS');
 assert.equal(accepted.route.id,'coordinated-accepted-ride');
 assert.notEqual(evaluateLiveWell({...ride,response:'coordinate',facts:{coordinatedTransportAccepted:true,accessibleTransportAvailable:false}}).metrics.outcome,'HOLDS');
 const health={strategy:'strengthen',investments:[{designId:'2B',strengthened:true}],start,scenarioId:'S2'};
 assert.equal(evaluateLiveWell({...health,response:'coordinate',facts:{coordinatedAssessmentConfirmed:true}}).metrics.outcome,'HOLDS');
 assert.equal(evaluateLiveWell({...health,response:'coordinate',facts:{coordinatedAssessmentConfirmed:true,assessmentAccepted:false}}).metrics.outcome,'EXPOSED');
 const event={strategy:'strengthen',investments:[{designId:'4C',strengthened:true}],start,scenarioId:'S3'};
 assert.equal(evaluateLiveWell({...event,response:'coordinate',facts:{coordinatedRelocationAccepted:true}}).metrics.outcome,'HOLDS');
 assert.notEqual(evaluateLiveWell({...event,response:'coordinate',facts:{coordinatedRelocationAccepted:true,alternateVenueConfirmed:false}}).metrics.outcome,'HOLDS');
});

test('General companions, care referral networks and inaccessible services cannot masquerade as transport or event arrangements',()=>{
 for(const id of ['3B','4B','4C']){
  const result=run(id,'S1',{transportRequestAccepted:false,assistanceAccepted:true,alternativeRouteVerified:true,currentRouteData:true});
  assert.notEqual(result.metrics.outcome,'HOLDS',id+' cannot automatically establish an accessible route or booked ride');
 }
 assert.notEqual(run('1C','S3',{updatedEventKnown:true,changedTransportAccepted:false}).metrics.outcome,'HOLDS');
 assert.notEqual(run('2B','S3',{eventOrganizerConfirmed:true,updatedEventKnown:true}).metrics.outcome,'HOLDS');
 assert.notEqual(run('3C','S2',{remoteAdviceAccepted:true,remoteParticipationAccepted:false}).metrics.outcome,'HOLDS');
 assert.notEqual(run('4C','S2',{communityConciergeAccepted:false,ordinaryContactAvailable:true}).metrics.outcome,'HOLDS');
 assert.equal(run('4C','S2',{communityConciergeAccepted:true}).metrics.outcome,'HOLDS');
 assert.equal(run('1C','S3',{updatedEventKnown:true,changedTransportAccepted:true}).metrics.outcome,'HOLDS');
});

test('All Three Futures labels and the unresolved safety outcome remain reachable without artificial scores',()=>{
 const fragmented=run('1A','S1');
 assert.equal(fragmented.metrics.future,'FRAGMENTED');
 const fragile=run('3A','S2',{communityReturnPossible:false});
 assert.equal(fragile.metrics.future,'CONNECTED_FRAGILE');
 const adaptable=run('1B','S1');
 assert.equal(adaptable.metrics.future,'ADAPTABLE_ACCOUNTABLE');
 const exposed=run('2A','S2',{assessmentAccepted:false,podClinicianAccepted:false});
 assert.equal(exposed.metrics.outcome,'EXPOSED');
 assert.equal(exposed.metrics.future,'FRAGMENTED');
});
