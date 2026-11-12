import {COSTS} from './recoveryContent.js';
const clinicalPaths=new Set(['routed-assessment','home-assessment','home-transfer-fallback','navigator-to-clinician','coach-to-clinician','evidence-to-review','reconciled-context-to-assessment','explicit-ordinary-assessment']);
// Presentation follows the actual dependency and historical evidence; it never upgrades a source record.
export function continuityReveal({handoff,investments,result,scenarioFacts,entryMode='standalone',titles={}}){
 if(!['standalone','continuous'].includes(entryMode))throw Error('Unknown continuity entry mode.');
 if(entryMode==='continuous'&&handoff.source.kind!=='leave-well')throw Error('Continuous framing requires a recorded Leave Well source.');
 const source=handoff.facts.verifiedTransitionPlan;
 const clinical=clinicalPaths.has(result.path.id)&&scenarioFacts.clinicalContextRequired===true;
 const offline=result.path.id==='outage-local-continuation'&&investments.some(i=>i.designId==='1A'&&i.strengthened)&&!(scenarioFacts.ordinaryWrittenRoutine===true&&scenarioFacts.ordinaryRoutineCurrent===true)&&scenarioFacts.approvedRoutine===true;
 const relevant=clinical||offline;
 const usable=offline?result.inheritance.localEssentialsReady===true:result.inheritance.priorContextUsable;
 const portableUsed=clinical&&usable&&scenarioFacts.planCopyReachable===false&&handoff.facts.portableMedicationContext.state==='established'&&scenarioFacts.medicationContextSufficient===true&&scenarioFacts.receiverParticipatesInPortableContext===true;
 const scope=portableUsed?handoff.facts.portableMedicationContext.scope:source.scope;
 let effect='none',foundation='No inherited condition materially affected the pathway used in this event.',now='This recovery pathway is independent of the inherited plan-confirmation state.',implication='Credit the actual recovery contribution; do not manufacture an upstream benefit or penalty.';
 if(relevant){
  foundation=portableUsed?'The source records confirmed medication context within participating settings.':source.state==='established'?(entryMode==='continuous'?'The recorded Leave Well history establishes a verified transition-plan reference.':'Arthur begins with a verified transition-plan reference from discharge.'):source.state==='open'?(entryMode==='continuous'?'The recorded Leave Well history includes an unresolved plan-confirmation task.':'Arthur’s starting case includes an unresolved plan-confirmation task.'):'The source does not establish plan confirmation; that remains unknown.';
  if(result.repair){
   effect='repaired';
   now=source.state==='open'?'Accepted qualified reconciliation established context here. The original confirmation gap remains in the recorded Leave Well history.':source.state==='established'?'Qualified reconciliation established the context needed now. The earlier plan was verified; its recorded history is unchanged.':'Qualified reconciliation established context here. Earlier source confirmation remains unknown; its record is unchanged.';
   implication='A recovery-local repair needs the actual reviewer, authority, acceptance and time—not merely a purchase.';
  }else if(result.contextReconstruction){
   effect='substituted';now=source.state==='open'?'Fresh qualified assessment supplied context for this concern; the earlier confirmation gap remains in its recorded history.':'Fresh qualified assessment supplied context for this concern; the earlier transition record is unchanged.';
   implication=source.state==='open'?'New assessment context is a local substitute, not proof that the inherited plan was repaired.':'New assessment context addresses today’s usability need without changing what was established at discharge.';
  }else if(usable){
   effect='enabled';now=offline?'Current verified essentials are locally available and usable by Arthur during the outage.':portableUsed?'The participating-setting context supplies this event’s information need when the plan copy is not reachable.':'The verified, reachable and current context is usable by this event’s receiving service.';
   implication=offline?'Design the local instruction route for Arthur’s access needs. Cached instructions are not live care or new clinical authority.':'Design information for its actual receiving setting. Usable context still does not create accepted services or capacity.';
  }else{
   effect='constrained';now=source.state==='established'?(offline?'Earlier verification exists, but a current, locally accessible and usable essentials copy is not established for Arthur.':'Earlier verification exists, but currentness, access or receiving-service usability is not established now.'):'The relevant context is not established for this event’s chosen pathway.';
   implication='Expose the particular verification or handoff gap. Do not blame unrelated hospital movement or assume a sensor repairs it.';
  }
 }
 const historyLabel=source.state==='open'?'ORIGINAL GAP PRESERVED':'EARLIER HISTORY UNCHANGED';
 const effectLabel={enabled:offline?'ENABLED BY VERIFIED LOCAL ESSENTIALS':'ENABLED BY THE STARTING FOUNDATION',constrained:'CONSTRAINED BY A CONTEXT GAP',repaired:'CONTEXT RECONCILED HERE · '+historyLabel,substituted:'NEW ASSESSMENT CONTEXT · '+historyLabel,none:'NO MATERIAL UPSTREAM EFFECT'}[effect];
 return {entryMode,effectLabel,historicalPlanState:source.state,heading:entryMode==='continuous'?'The recorded Leave Well foundation':'Arthur’s starting recovery foundation',designedNow:investments.map(i=>titles[i.designId]||i.designId),inheritedCondition:relevant?(portableUsed?'Plan portability within participating medication-context scope':'Transition-plan verification and current usability'):null,effect,foundation,now,implication,sourceRunId:handoff.source.runId,scope:relevant?scope:[],repairCharge:effect==='repaired'&&result.response==='adapt'?{...COSTS.adapt}:null,guardrail:entryMode==='standalone'?'This is the starting case’s provenance, not a claim that you played Leave Well.':'The recorded history remains unchanged; this reveal is not server authentication.'};
}
