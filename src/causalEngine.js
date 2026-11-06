// Arthur: By Design - Leave Well causal alignment engine v1
// Canonical choice semantics. Legacy gameData keys are intentionally supported as stable aliases.
export const causalChoices={
 ambient:{
  bedside:{canonicalId:'smart-discharge.ai-plan-first',title:'AI PLAN FIRST',needs:{UNDERSTAND:2,CONNECT:1,TRUST:1},events:{route:{fit:.1},information:{fit:.55,detect:true,understand:true},coordination:{fit:.15}},dependencies:['clinicalVerification','consentGovernance'],strengthen:{adds:['clinicalVerification','fallbackReview'],copy:'Strengthening assigns verification and a fallback review path to the intelligent plan.'}},
  shared:{canonicalId:'smart-discharge.review-together',title:'REVIEW TOGETHER',needs:{UNDERSTAND:3,CONNECT:2,TRUST:2},events:{route:{fit:.1},information:{fit:1,understand:true,resolve:true},coordination:{fit:.35}},dependencies:['protectedConversationTime','reviewParticipants'],strengthen:{adds:['backupConsultationCapacity','protectedConversationTime'],copy:'Strengthening protects alternate consultation capacity and review time.'}},
  dedicated:{canonicalId:'smart-discharge.transition-guide',title:'TRANSITION GUIDE',needs:{UNDERSTAND:2,CONNECT:2,TRUST:2,MOVE:1},events:{route:{fit:.35},information:{fit:.65,understand:true},coordination:{fit:.85,carry:true,execute:true}},dependencies:['guideAvailable','handoffContinuity'],strengthen:{adds:['backupGuide','handoffContinuity'],copy:'Strengthening adds backup coverage and protects continuity between handoffs.'}}
 },
 wayfinding:{
  digital:{canonicalId:'smart-routes.personal-digital-guidance',title:'APP FIRST',needs:{MOVE:2,TRUST:1},events:{route:{fit:.55,detect:true},information:{fit:0},coordination:{fit:.1}},dependencies:['currentRouteData','deviceAvailable'],strengthen:{adds:['deviceIndependentFallback','positioningResilience'],copy:'Strengthening adds device-independent fallback and more resilient positioning.'}},
  layered:{canonicalId:'smart-routes.layered-guidance',title:'LAYERED GUIDANCE',needs:{MOVE:3,TRUST:3,UNDERSTAND:1},events:{route:{fit:1,detect:true,understand:true,execute:true},information:{fit:.05},coordination:{fit:.15}},dependencies:['guidanceSynchronization','routeGovernance'],strengthen:{adds:['alternateRouteConsistency','guidanceSynchronization'],copy:'Strengthening protects synchronization and alternate-route consistency.'}},
  escort:{canonicalId:'smart-routes.guided-transition',title:'GUIDED TRANSITION',needs:{MOVE:2,TRUST:2,CONNECT:1},events:{route:{fit:.8,understand:true,execute:true},information:{fit:0},coordination:{fit:.35}},dependencies:['navigationGuideAvailable','guideHandoff'],strengthen:{adds:['backupNavigationCoverage','guideHandoff'],copy:'Strengthening adds guide coverage and reliable handoffs at complex transitions.'}}
 },
 meds:{
  nurse:{canonicalId:'medication-check.ai-check-first',title:'AI CHECK FIRST',needs:{UNDERSTAND:1,CONNECT:1,TRUST:1},events:{route:{fit:0},information:{fit:.55,detect:true},coordination:{fit:.1}},dependencies:['clinicalResolver','alertOwnership'],strengthen:{adds:['assignedClinicalResolver','alertPrioritization'],copy:'Strengthening assigns a clinical resolver and prioritizes the discrepancy alert.'}},
  pharmacy:{canonicalId:'medication-check.review-together',title:'REVIEW TOGETHER',needs:{UNDERSTAND:3,CONNECT:2,TRUST:3},events:{route:{fit:0},information:{fit:1,detect:true,understand:true,resolve:true},coordination:{fit:.15}},dependencies:['reviewerAvailable','protectedMedicationReview'],strengthen:{adds:['backupReviewer','accountableMedicationOwner'],copy:'Strengthening protects reviewer availability and accountable ownership.'}},
  huddle:{canonicalId:'medication-check.plan-follows-arthur',title:'PLAN FOLLOWS ARTHUR',needs:{CONNECT:3,TRUST:2,UNDERSTAND:1},events:{route:{fit:0},information:{fit:.45,carry:true,requires:'authoritativeMedicationPlan'},coordination:{fit:.8,carry:true,requires:'authoritativeMedicationPlan'}},dependencies:['authoritativeMedicationPlan','downstreamParticipation'],strengthen:{adds:['authoritativePlanGovernance','resilientPlanAccess'],copy:'Strengthening protects authoritative-plan governance and resilient access across settings.'}}
 },
 command:{
  unit:{canonicalId:'coordinated-response.system-alert',title:'SYSTEM ALERT',needs:{CONNECT:2,TRUST:1},events:{route:{fit:.2,detect:true},information:{fit:.15,detect:true},coordination:{fit:.55,detect:true}},dependencies:['alertOwnership','responseAuthority'],response:{awareness:true,authority:false,capacity:false,execution:false},strengthen:{adds:['escalationOwner','alertPrioritization'],copy:'Strengthening assigns escalation ownership and prioritizes operational alerts.'}},
  center:{canonicalId:'coordinated-response.coordinated-response',title:'COORDINATED RESPONSE',needs:{MOVE:2,CONNECT:3,TRUST:3},events:{route:{fit:.75,detect:true,execute:true},information:{fit:.35,detect:true},coordination:{fit:1,detect:true,execute:true}},dependencies:['responseAuthority','appropriateCapacity','executionReadiness'],response:{awareness:true,authority:true,capacity:'finite',execution:'conditional'},strengthen:{adds:['standbyCapacity','executionReadiness'],copy:'Strengthening protects standby capacity and execution readiness.'}},
  liaison:{canonicalId:'coordinated-response.transition-guide',title:'TRANSITION GUIDE',needs:{CONNECT:2,TRUST:3,MOVE:1,UNDERSTAND:1},events:{route:{fit:.4,execute:true},information:{fit:.3,understand:true},coordination:{fit:.85,detect:true,execute:true}},dependencies:['coordinatorAvailable','boundedAuthority','availableAlternative'],response:{awareness:true,authority:'bounded',capacity:false,execution:'humanDependent'},strengthen:{adds:['backupCoordinator','expandedEscalationAuthority'],copy:'Strengthening adds backup coordinator coverage and clearer escalation authority.'}}
 }
};
export const eventDefinitions={
 route:{label:'ROUTE CHANGED',pressure:['MOVE','TRUST'],chain:['detect','understand','execute']},
 information:{label:'PLAN CHANGED',pressure:['UNDERSTAND','CONNECT'],chain:['detect','resolve','carry']},
 coordination:{label:'HANDOFF CHANGED',pressure:['CONNECT','TRUST'],chain:['detect','authority','capacity','execute']}
};
const values=o=>Object.values(o||{});
export function canonicalChoice(a){return causalChoices[a?.capabilityId]?.[a?.commitmentId]||null}
export function dependencySet(state){let s=new Set(state?.dependencies||[]);(state?.activations||[]).forEach(a=>{(a.operatingReadiness||a.operation?.readiness||[]).forEach?.(x=>s.add(x));if(a.strengthened)(canonicalChoice(a)?.strengthen?.adds||[]).forEach(x=>s.add(x));});return s}
export function choiceEffect(a,eventId,deps=new Set()){
 const c=canonicalChoice(a),e=c?.events?.[eventId]||{fit:0};if(!c)return{fit:0,causal:'Legacy choice is not mapped to the canonical design.'};
 let fit=e.fit||0,blocked=null;
 if(e.requires&&!deps.has(e.requires)){fit=Math.min(fit,.15);blocked=e.requires}
 const satisfied=c.dependencies.filter(x=>deps.has(x)).length;
 fit+=Math.min(.2,satisfied*.05);
 return{fit:Math.min(1.2,fit),blocked,flags:e,title:c.title,canonicalId:c.canonicalId,causal:causalExplanation(a,eventId,{blocked})}
}
export function causalExplanation(a,eventId,{blocked=null}={}){const c=canonicalChoice(a);if(!c)return'Choice semantics are unavailable.';if(blocked==='authoritativeMedicationPlan')return`${c.title} can carry a confirmed medication plan, but this disruption has not established which plan is authoritative.`;const key=`${a.capabilityId}.${a.commitmentId}.${eventId}`;const map={
 'ambient.bedside.information':'Ambient intelligence captures the changed plan, but a clear review and clinical confirmation are still required.',
 'ambient.shared.information':'The protected shared review helps Arthur understand and confirm the changed plan; downstream coordination remains separate.',
 'ambient.dedicated.coordination':'A connected guide carries the revised transition context across handoffs, subject to guide availability.',
 'wayfinding.digital.route':'Personal guidance recalculates the route, but the physical environment may not confirm the detour.',
 'wayfinding.layered.route':'Stable landmarks, physical cues and responsive information make the alternate route understandable.',
 'wayfinding.escort.route':'A guide gets Arthur through the changed route, provided navigation coverage is available.',
 'meds.nurse.information':'The discrepancy becomes visible, but a qualified clinician still has to decide which medication plan is correct.',
 'meds.pharmacy.information':'Arthur and the clinician or pharmacist can resolve and understand the discrepancy together; persistence is not automatic.',
 'meds.huddle.information':'The design can carry a confirmed plan forward, but connectivity cannot decide which conflicting record is correct.',
 'meds.huddle.coordination':'The confirmed medication plan can remain available across participating settings, but availability does not guarantee action.',
 'command.unit.coordination':'The hospital sees the handoff problem early, but awareness does not create authority or capacity.',
 'command.center.coordination':'The hospital can coordinate an appropriate alternative when authority, finite capacity and execution readiness align.',
 'command.liaison.coordination':'An empowered coordinator can intervene across services, but success depends on bounded authority and an available alternative.'
};return map[key]||`${c.title} contributes to ${eventDefinitions[eventId]?.label.toLowerCase()||'the disruption'}, while its stated dependencies remain active.`}
export function responseEligibility(state,responseId,eventId){if(responseId==='use')return{eligible:true,boost:0,why:'The funded design must hold without extra recovery capacity.'};const deps=dependencySet(state),acts=state.activations||[],choices=acts.map(canonicalChoice).filter(Boolean);if(responseId==='adapt'){const adaptable=choices.some(c=>['TRANSFORMED','ADAPTED','DISTRIBUTED','RESPONSIVE'].includes(c.transformation)||values(c.events).some(e=>e.execute));return adaptable?{eligible:true,boost:.55,why:'The portfolio contains a design element that can be adapted to this disruption.'}:{eligible:false,boost:0,why:'Adapt was selected, but the portfolio did not create an adaptable route, space, service or information path.'}}
 if(responseId==='escalate'){const authority=deps.has('responseAuthority')||deps.has('expandedEscalationAuthority')||choices.some(c=>c.response?.authority===true||c.response?.authority==='bounded');const recipient=choices.some(c=>c.events?.[eventId]?.resolve||c.events?.[eventId]?.execute);return authority&&recipient?{eligible:true,boost:.8,why:'An accountable role has authority and a relevant path to act.'}:{eligible:false,boost:.1,why:'Escalation made the problem visible, but authority or a viable response path was missing.'}}
 return{eligible:false,boost:0,why:'Unknown response.'}}
export function evaluatePortfolio(state,eventId=state.eventId||'route',responseId=state.response||'use'){
 const event=eventDefinitions[eventId],deps=dependencySet(state),effects=(state.activations||[]).map(a=>({...choiceEffect(a,eventId,deps),activation:a}));
 const need={UNDERSTAND:0,MOVE:0,CONNECT:0,TRUST:0};(state.activations||[]).forEach(a=>{let c=canonicalChoice(a);Object.entries(c?.needs||{}).forEach(([k,v])=>need[k]=Math.min(3,need[k]+v))});
 const pressureAvg=event.pressure.reduce((n,k)=>n+need[k],0)/event.pressure.length;
 const fit=effects.reduce((n,e)=>n+e.fit,0);
 const response=responseEligibility(state,responseId,eventId);
 const blocked=effects.filter(e=>e.blocked).length;
 const raw=pressureAvg*.65+fit+response.boost-blocked*.35;
 const outcome=raw>=3.8?'ABSORBED':raw>=2.15?'STRAINED':'EXPOSED';
 return{outcome,raw:+raw.toFixed(2),scores:need,event,effects,response,dependencies:[...deps],vulnerabilities:event.pressure.filter(k=>need[k]<2),causalSummary:effects.map(e=>e.causal)}
}
export function strengthenCopy(a){return canonicalChoice(a)?.strengthen?.copy||'Strengthening reinforces the selected design’s stated vulnerability.'}
export function compareEvaluations(before,after){const rank={EXPOSED:0,STRAINED:1,ABSORBED:2},delta=rank[after.outcome]-rank[before.outcome];return{classificationChanged:delta!==0,delta,before:before.outcome,after:after.outcome,whatChanged:after.causalSummary.filter(x=>!before.causalSummary.includes(x)),summary:delta>0?'The revised design improved how Arthur experienced the same disruption.':delta<0?'The revised design removed protection Arthur previously relied on.':'The headline result stayed the same, but the causal path and remaining dependency changed.'}}
