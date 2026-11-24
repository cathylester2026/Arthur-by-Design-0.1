import test from 'node:test';
import assert from 'node:assert/strict';
import {leaveLegacy,recoveryLegacy,recoveryInvestmentReadiness,liveInvestmentReadiness,budgetPolicy} from '../src/designLegacy.js';
import {standaloneHandoff} from '../src/recoverWell/leaveWellHandoff.js';
import {makeLiveStart,evaluateLiveWell} from '../src/liveWell/liveResolver.js';

test('Design Legacy distinguishes verified evidence from a funded capability',()=>{
 const verified=standaloneHandoff('supported'),open=standaloneHandoff('open');
 assert.equal(leaveLegacy(verified).established.find(x=>x.id==='plan').state,'established');
 assert.equal(recoveryInvestmentReadiness(verified,'personalized').state,'foundation');
 assert.equal(recoveryInvestmentReadiness(open,'personalized').state,'needs-work');
 assert.equal(recoveryInvestmentReadiness(open,'rehab').state,'independent');
 assert.equal(budgetPolicy.carryForward,false);
 assert.equal(budgetPolicy.capital,7);
 assert.equal(budgetPolicy.change,6);
});
const passport=useful=>({schema:'rw.exit.v1',source:{chapter:'recover-well',runId:'recover-one',leaveWellRunId:'leave-one'},
 decisions:{portfolio:[],strategy:'strengthen',response:'use'},
 resourcesRemaining:{capital:1,change:1},
 established:{outcome:'HOLDS',priorClinicalContextUsable:useful,contextReconciledInRecovery:false},
 dependencies:{unresolved:[],continuingCommunityServiceAccepted:null,ongoingMonitoringOwnerConfirmed:null}});
const request=(start,facts={})=>evaluateLiveWell({start,investments:[{designId:'3B',strengthened:true}],strategy:'strengthen',scenarioId:'S2',response:'use',facts});
test('Earlier confirmed context reduces effort, not service acceptance, clinical safety or participation',()=>{
 const connected=makeLiveStart({recoveryPassport:passport(true)});
 const unconfirmed=makeLiveStart({recoveryPassport:passport(false)});
 const a=request(connected),b=request(unconfirmed);
 assert.equal(a.designLegacy.status,'enabled');
 assert.equal(a.designLegacy.reduction,1);
 assert.equal(a.designLegacy.leaveWellRunId,'leave-one');
 assert.equal(a.metrics.burden,b.metrics.burden-1);
 assert.equal(a.metrics.participation,b.metrics.participation);
 assert.equal(a.metrics.safetyEstablished,b.metrics.safetyEstablished);
 assert.equal(a.metrics.outcome,b.metrics.outcome);
 const notCurrent=request(connected,{clinicalContextCurrent:false});
 assert.equal(notCurrent.designLegacy.reduction,0);
 const noService=request(connected,{assessmentAccepted:false});
 assert.equal(noService.designLegacy.reduction,0);
 assert.equal(noService.metrics.outcome,'EXPOSED');
 assert.equal(liveInvestmentReadiness(passport(true),'care').state,'foundation');
 assert.equal(liveInvestmentReadiness(passport(false),'care').state,'needs-work');
 assert.equal(liveInvestmentReadiness(passport(true),'mobility').state,'independent');
});

test('Existing saved Live Well starts replay without the new legacy outcome field',()=>{
 const old=makeLiveStart({recoveryPassport:passport(true)});
 delete old.legacyPolicy;
 const result=request(old);
 assert.equal(Object.hasOwn(result,'designLegacy'),false);
 const fresh=makeLiveStart({recoveryPassport:passport(true)});
 assert.equal(request(fresh).designLegacy.status,'enabled');
});

test('Second independently usable design earns a bounded fallback, not a fabricated service',()=>{
 const start=makeLiveStart({recoveryPassport:passport(false)});
 const two={start,scenarioId:'S1',strategy:'extend',investments:[{designId:'1A',strengthened:false},{designId:'3A',strengthened:false}],response:'use',
  facts:{alternativeRouteVerified:true,currentRouteData:true,physicalWayfindingAvailable:true}};
 const a=evaluateLiveWell(two);
 const b=evaluateLiveWell({...two,start:{...start,legacyPolicy:'verified-handoff-v1'}});
 assert.equal(a.designLegacy.fallbackUsed!==null,true);
 assert.equal(a.metrics.participation,b.metrics.participation);
 assert.equal(a.metrics.safetyEstablished,b.metrics.safetyEstablished);
 assert.equal(a.metrics.burden,b.metrics.burden-1);
 const blocked=evaluateLiveWell({...two,facts:{alternativeRouteVerified:false,currentRouteData:false,physicalWayfindingAvailable:false}});
 assert.equal(blocked.designLegacy.fallbackUsed,null);
 assert.notEqual(blocked.metrics.outcome,'HOLDS');
});
test('Usable prior context reduces repetition on existing ordinary qualified care without granting participation',()=>{
 const start=makeLiveStart({recoveryPassport:passport(true)});
 const input={start,investments:[{designId:'2B',strengthened:true}],strategy:'strengthen',scenarioId:'S2',response:'ordinary'};
 const prior=evaluateLiveWell(input),noPrior=evaluateLiveWell({...input,start:makeLiveStart({recoveryPassport:passport(false)})});
 assert.equal(prior.route.designId,null);
 assert.equal(prior.metrics.outcome,'STRAINED');
 assert.equal(prior.metrics.participation,false);
 assert.equal(prior.designLegacy.reduction,1);
 assert.equal(prior.metrics.burden,noPrior.metrics.burden-1);
 const declined=evaluateLiveWell({...input,facts:{assessmentAccepted:false}});
 assert.equal(declined.designLegacy.reduction,0);
 assert.equal(declined.metrics.outcome,'EXPOSED');
});
