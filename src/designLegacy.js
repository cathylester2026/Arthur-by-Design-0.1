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
export function liveDesignReadiness(passport,id){
 const rule=designRules[id];
 if(!rule)throw Error('Unknown community design.');
 const carry=liveInvestmentReadiness(passport,rule.prior?'care':'services');
 return frozen({need:rule.name,state:rule.prior?carry.state:'independent',canInvest:true,
  reason:rule.prior?(carry.state==='foundation'?'Earlier usable clinical information can reduce repeated work, but does not establish this service.':'Current clinical information needs to be checked or reconstructed; the service must independently accept Arthur.'):
   'This design does not require an earlier investment, but its real-world operating conditions must still be established.'});
}
