// Evidence-scoped legacy: purchased != established != presently usable != realized.
// No cross-chapter transfer of budget or automatic clinical/service entitlement.
const frozen=o=>Object.freeze(o);
export function leaveLegacy(handoff){
 const f=handoff.facts,source=handoff.source;
 return frozen({
  chapter:'leave-well',runId:source.runId,
  remaining:null,
  investments:(source.investments||[]).map(x=>({...x})),
  established:[
   {id:'plan',name:'Checked transition plan',state:f.verifiedTransitionPlan.state,why:f.verifiedTransitionPlan.reason,now:'Can support receiving care when current and accepted.'},
   {id:'medication',name:'Portable medication information',state:f.portableMedicationContext.state,why:f.portableMedicationContext.reason,now:'Useful only within confirmed participating settings.'},
   {id:'handoff',name:'Hospital departure ownership',state:f.hospitalHandoff.state,why:f.hospitalHandoff.reason,now:'Hospital departure ownership does not establish home-care acceptance.'},
   {id:'movement',name:'Hospital movement',state:f.hospitalMovement.state,why:f.hospitalMovement.reason,now:'Does not establish accessible home or community travel.'}
  ],
  open:['plan','medication','handoff','movement'].filter(id=>({plan:f.verifiedTransitionPlan,medication:f.portableMedicationContext,handoff:f.hospitalHandoff,movement:f.hospitalMovement})[id].state!=='established')
 });
}
export function recoveryLegacy(run){
 if(!run?.result)return null;
 const r=run.result,p=r.path||{};
 return frozen({
  chapter:'recover-well',runId:run.runId,
  remaining:{capital:run.capital,change:run.change},
  investments:(run.investments||[]).map(x=>({...x})),
  outcome:r.outcome,
  established:[
   {id:'next-step',name:'Recovery next step',state:r.outcome==='EXPOSED'?'open':'established',why:r.outcome==='EXPOSED'?'An appropriate complete pathway was not established.':'A next step was established for this recovery event.',now:'Does not establish ongoing community service capacity.'},
   {id:'clinical-context',name:'Usable clinical context',state:r.inheritance?.priorContextUsable===true||r.inheritance?.recoveryReconciliationUsed===true?'established':'unknown',why:'Context used or reconciled in the recovery event, not permanent clinical clearance.',now:'Requires currentness and acceptance by a new receiving service.'},
   {id:'service-ownership',name:'Continuing community service',state:'unknown',why:'A single accepted recovery response does not establish future staffing or service acceptance.',now:'Community participation requires new arrangements.'}
  ],
  open:[...(p.gaps||[])],
  used:[...(p.designIds||[])]
 });
}
const readiness={
 personalized:{need:'Checked, current care instructions',why:'Daily guidance must not rely on an unresolved or outdated plan.'},
 warning:{need:'Qualified owner for monitoring and response',why:'A monitoring investment is not an accepted responding service.'},
 response:{need:'Current clinical context and accepted receiving service',why:'A qualified team must accept the handoff or reconstruct context.'},
 rehab:{need:'Approved recovery activity and a suitable home',why:'Discharge technology cannot authorize exercise or make a home accessible.'}
};
export function recoveryInvestmentReadiness(handoff,familyId){
 const item=readiness[familyId];if(!item)throw Error('Unknown recovery family.');
 const checked=handoff.facts.verifiedTransitionPlan.state==='established';
 const relevant=familyId==='personalized'||familyId==='response';
 return frozen({state:relevant?(checked?'foundation':'needs-work'):'independent',need:item.need,reason:relevant?(checked?'A checked discharge plan exists; verify it remains usable here.':'The discharge plan is not confirmed by your earlier decisions; a current qualified check is needed.'):item.why,
  canInvest:true});
}
const liveNeeds={
 mobility:{need:'Accessible physical route or accepted transport',type:'independent'},
 care:{need:'Qualified receiving service and current clinical information',type:'clinical'},
 wellness:{need:'Approved goals and current information for health-related designs',type:'mixed'},
 services:{need:'Confirmed venue and accountable community support',type:'independent'}
};
export function liveInvestmentReadiness(passport,familyId){
 const item=liveNeeds[familyId];if(!item)throw Error('Unknown Live Well family.');
 const verified=!!(passport&&(passport.established.priorClinicalContextUsable||passport.established.contextReconciledInRecovery));
 const linked=!!passport;
 return frozen({
  state:item.type==='clinical'&&linked?(verified?'foundation':'needs-work'):'independent',
  need:item.need,canInvest:true,
  reason:item.type==='clinical'&&linked?(verified?'Recovery established usable context. A new service must still accept current information.':'Earlier recovery did not establish reusable clinical context. It can be checked or reconstructed by qualified care.'):item.type==='clinical'?'The standalone case does not claim an earlier verified clinical foundation.':'This design has its own community prerequisites; hospital investments do not create them.'
 });
}
export const budgetPolicy=frozen({capital:7,change:6,carryForward:false,why:'Capital and Change are chapter-specific allocations. Only verified capabilities and unresolved dependencies cross chapters.'});

const designRules={
 '1A':{name:'Verified route data',prior:false},'1B':{name:'Real accessible paths and detours',prior:false},'1C':{name:'Accepted accessible transport',prior:false},
 '2A':{name:'Operational pod and accepted qualified clinician',prior:true},'2B':{name:'Accepted qualified local care network',prior:true},'2C':{name:'Staffed mobile assessment acceptance',prior:true},
 '3A':{name:'Approved activity goals and safe pacing limits',prior:false},'3B':{name:'Current usable clinical information and qualified receiving service',prior:true},'3C':{name:'An accepted accessible way to join the activity',prior:false},
 '4A':{name:'Accessible staffed participation and rest arrangements',prior:false},'4B':{name:'Confirmed accessible community venue',prior:false},'4C':{name:'An accountable coordinator and actually accepted services',prior:false}
};
export const LIVE_DESIGN_SCOPE=Object.freeze({
 '1A':['route','venue'],'1B':['route','venue'],'1C':['route','care','venue'],
 '2A':['care'],'2B':['care'],'2C':['care'],
 '3A':['route','care'],'3B':['care'],'3C':['care','venue'],
 '4A':['care','venue'],'4B':['venue'],'4C':['route','care','venue']
});
export const LIVE_SCENARIO_LABELS=Object.freeze({route:'Route disruption',care:'Health concern',venue:'Venue change'});
export function liveDesignReadiness(passport,id){
 const rule=designRules[id];
 if(!rule)throw Error('Unknown community design.');
 const carry=liveInvestmentReadiness(passport,rule.prior?'care':'services');
 return frozen({need:rule.name,scope:LIVE_DESIGN_SCOPE[id],scopeLabels:LIVE_DESIGN_SCOPE[id].map(k=>LIVE_SCENARIO_LABELS[k]),state:rule.prior?carry.state:'independent',canInvest:true,
  reason:rule.prior?(carry.state==='foundation'?'Earlier usable clinical information can reduce repeated work, but does not establish this service.':'Current clinical information needs to be checked or reconstructed; the service must independently accept Arthur.'):
   'This design does not require an earlier investment, but its real-world operating conditions must still be established.'});
}

/** Player-facing causal transition. Every claim is scoped to facts from the saved run. */
export function leaveConsequences(handoff){
 const f=handoff.facts,source=handoff.source,plan=f.verifiedTransitionPlan.state;
 const established=plan==='established';
 return frozen({
  title:established?'Arthur brings a checked plan home.':'Arthur must check his plan again.',
  overallOutcome:source.evaluation?.outcome||null,
  context:established&&source.evaluation?.outcome!=='HOLDS'?'The plan was verified, even though other hospital needs prevented the overall discharge journey from holding.':null,
  enables:established?'Receiving care can use the verified discharge reference if it is still current and accepted.':'Arthur can seek care, but support relying on changed instructions needs a qualified check.',
  needs:established?'A receiving care team must confirm the plan remains current and usable.':'Plan confirmation remains unfinished; purchasing recovery guidance cannot complete it.',
  difference:established?'The next chapter can start from verified information rather than assuming it must be recreated.':'A recovery response may need verification or fresh qualified assessment before using the plan.',
  budget:'No hospital Capital or Change transfers to the home chapter.'
 });
}
export function recoveryConsequences(run){
 if(!run?.result)throw Error('A completed recovery outcome is required.');
 const result=run.result,original=run.handoff?.facts?.verifiedTransitionPlan?.state;
 const reused=result.inheritance?.priorContextUsable===true;
 const repaired=result.inheritance?.recoveryReconciliationUsed===true;
 const response=result.response||run.response;
 const charge=repaired&&response==='adapt'?{capital:0,change:1}:null;
 const used=(result.path?.designIds||[]).filter(id=>(run.investments||[]).some(i=>i.designId===id));
 let title,enables,needs;
 if(repaired){
  title='Recovery made new information usable.';
  enables='A qualified reconciliation established context for this recovery event. Arthur can carry that evidence into a later accepted clinical handoff.';
  needs='The original discharge gap still occurred. Live Well must recheck currentness and service acceptance.';
 }else if(reused){
  title='Arthur used an earlier clinical foundation.';
  enables='The current recovery pathway used verified prior clinical context without a new reconciliation for this event.';
  needs='A new receiving service must still accept the information. This does not create ongoing care coverage.';
 }else{
  title='No reusable clinical foundation was established here.';
  enables=result.outcome==='EXPOSED'?'The recovery event did not establish every required next step.':'Arthur may still have an appropriate next step or a usable nonclinical design.';
  needs='Clinical context must be checked independently if a later qualified service requires it.';
 }
 const effective=result.outcome==='EXPOSED'?'An essential step remained unestablished.':used.length?'Used recovery investment'+(used.length>1?'s ':' ')+used.join(', ')+' contributed to this event.':'The selected recovery investments were not credited as used in the chosen response.';
 return frozen({title,enables,needs,actual:effective,used,repaired,reused,originalPlanState:original||'unknown',
  repairEffort:charge?'The Adapt response cost 1 Recovery Change; the chosen response included qualified reconciliation.':'No new cross-chapter resource charge is inferred.',
  carryToLive:repaired?'Newly reconciled clinical context may reduce later repeated work if accepted.':reused?'Verified context may reduce repeated work for a new accepted qualified receiver.':'No clinical handoff benefit is automatically granted.',
  budget:'Unspent Recovery Capital and Change do not carry into Live Well.'});
}
export function liveConsequences(passport,result){
 if(!result)throw Error('A completed Live Well result is required.');
 const legacy=result.designLegacy;
 const purchased=result.investments.map(i=>i.designId),used=result.route?.designId,backup=result.designLegacy?.fallbackUsed||null;
 const basedOnRecovery=!!passport;
 const origin=passport?.established?.contextReconciledInRecovery===true?'reconciled':
   passport?.established?.priorClinicalContextUsable===true?'reused':'none';
 let why;
 if(legacy?.reduction){
  why=origin==='reconciled'?'Recovery had to reconcile clinical information before Arthur could reuse it. This event avoided one unit of repeated handoff effort.':'The earlier usable care information was accepted here and avoided one unit of repeated handoff effort.';
 }else if(legacy?.status==='requires-verification'){
  why='An earlier record did not demonstrate current, accepted clinical information for this event. No handoff-effort reduction was awarded.';
 }else why='The earlier design history did not materially change this community response.';
 const investedButUnused=purchased.filter(id=>id!==used&&id!==backup);
 return frozen({title:result.metrics.participation?'Arthur found a workable way to take part.':result.metrics.safetyEstablished?'Arthur did not complete this outing.':'Arthur still needs a safe response.',
  why,origin,used:used||null,backup,unused:investedButUnused,burdenReduction:legacy?.reduction||0,
  needs:result.metrics.safetyEstablished?'This event does not establish ongoing future service or infrastructure availability.':'An accepted qualified response is still required before claiming safe participation.',
  independent:!basedOnRecovery?'This standalone run does not claim earlier decisions.':'Prior hospital investments do not automatically create community routes, staffing or care capacity.'});
}
