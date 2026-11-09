// Arthur: By Design - Leave Well causal engine v2
// Aligns the twelve player-facing design choices with readiness, response, consequence, and revision logic.
const C=(canonicalId,title,needs,events,baselineReadiness,strengthen,adapt,escalate,response={})=>({canonicalId,title,needs,events,baselineReadiness,strengthen,adapt,escalate,response});
export const causalChoices={
 ambient:{
  bedside:C('smart-discharge.ai-plan-first','AI PLAN FIRST',{UNDERSTAND:2,CONNECT:1,TRUST:1},{route:.1,information:.65,coordination:.2},['clinicalVerification','consentGovernance'],{adds:['assignedPlanReviewer','fallbackReview'],event:{information:.35},copy:'Strengthening assigns a plan reviewer and fallback review path.'},{information:'updatePlan'}, {information:'planReviewer'}),
  shared:C('smart-discharge.review-together','REVIEW TOGETHER',{UNDERSTAND:3,CONNECT:2,TRUST:2},{route:.1,information:1.05,coordination:.35},['protectedConversationTime','reviewParticipants'],{adds:['backupConsultationCapacity','protectedConversationTime'],event:{information:.25,coordination:.15},copy:'Strengthening protects alternate consultation capacity and review time.'},{information:'protectedReview'}, {information:'transitionPlanOwner'}),
  dedicated:C('smart-discharge.transition-guide','TRANSITION GUIDE',{UNDERSTAND:2,CONNECT:2,TRUST:2,MOVE:1},{route:.35,information:.65,coordination:.9},['guideAvailable','handoffContinuity'],{adds:['backupGuide','handoffContinuity'],event:{coordination:.3,route:.15},copy:'Strengthening adds backup coverage and protects continuity between handoffs.'},{route:'mobileGuide',coordination:'resequenceHandoff'}, {route:'transitionGuide',information:'transitionGuide',coordination:'transitionGuide'})
 },
 wayfinding:{
  digital:C('smart-routes.personal-digital-guidance','APP FIRST',{MOVE:2,TRUST:1},{route:.65,information:0,coordination:.1},['currentRouteData','deviceAvailable'],{adds:['deviceIndependentFallback','positioningResilience'],event:{route:.3},copy:'Strengthening adds device-independent fallback and resilient positioning.'},{route:'recalculate'}, {route:'wayfindingOwner'}),
  layered:C('smart-routes.layered-guidance','LAYERED GUIDANCE',{MOVE:3,TRUST:3,UNDERSTAND:1},{route:1.15,information:.05,coordination:.15},['guidanceSynchronization','routeGovernance'],{adds:['alternateRouteConsistency','guidanceSynchronization'],event:{route:.3},copy:'Strengthening protects synchronization and alternate-route consistency.'},{route:'responsiveGuidance'}, {route:'routeGovernanceOwner'}),
  escort:C('smart-routes.guided-transition','GUIDED TRANSITION',{MOVE:2,TRUST:2,CONNECT:1},{route:.9,information:0,coordination:.35},['navigationGuideAvailable','guideHandoff'],{adds:['backupNavigationCoverage','guideHandoff'],event:{route:.3,coordination:.1},copy:'Strengthening adds guide coverage and reliable handoffs.'},{route:'guideReroute'}, {route:'navigationGuide',coordination:'navigationGuide'})
 },
 meds:{
  nurse:C('medication-check.ai-check-first','AI CHECK FIRST',{UNDERSTAND:1,CONNECT:1,TRUST:1},{route:0,information:.65,coordination:.1},['clinicalResolver','alertOwnership'],{adds:['authoritativeMedicationPlan','assignedClinicalResolver','alertPrioritization'],event:{information:.45},copy:'Strengthening assigns a clinical resolver and establishes an authoritative medication plan.'},{information:'rerouteAlert'}, {information:'clinicalResolver'}),
  pharmacy:C('medication-check.review-together','REVIEW TOGETHER',{UNDERSTAND:3,CONNECT:2,TRUST:3},{route:0,information:1.15,coordination:.2},['reviewerAvailable','protectedMedicationReview','authoritativeMedicationPlan'],{adds:['backupReviewer','accountableMedicationOwner'],event:{information:.25,coordination:.1},copy:'Strengthening protects reviewer availability and accountable ownership.'},{information:'protectedMedicationReview'}, {information:'medicationReviewer'}),
  huddle:C('medication-check.plan-follows-arthur','PLAN FOLLOWS ARTHUR',{CONNECT:3,TRUST:2,UNDERSTAND:1},{route:0,information:.65,coordination:.9},['confirmedPlanAtDischarge','medicationContinuityInfrastructure','resilientPlanAccess'],{adds:['authoritativePlanGovernance','offlinePlanAccess'],event:{information:.25,coordination:.3},copy:'Strengthening protects authoritative-plan governance and resilient access across settings.'},{information:'alternatePlanAccess',coordination:'alternatePlanAccess'}, {information:'medicationPlanOwner',coordination:'medicationPlanOwner'})
 },
 command:{
  unit:C('coordinated-response.system-alert','SYSTEM ALERT',{CONNECT:2,TRUST:1},{route:.25,information:.2,coordination:.6},['alertOwnership','operationalAwareness'],{adds:['escalationOwner','alertPrioritization'],event:{coordination:.25,route:.1},copy:'Strengthening assigns escalation ownership and prioritizes operational alerts.'},{}, {route:'escalationOwner',information:'escalationOwner',coordination:'escalationOwner'},{awareness:true,authority:false,capacity:false,execution:false}),
  center:C('coordinated-response.coordinated-response','COORDINATED RESPONSE',{MOVE:2,CONNECT:3,TRUST:3},{route:.85,information:.4,coordination:1.2},['responseAuthority','appropriateCapacity','executionReadiness'],{adds:['standbyCapacity','executionReadiness'],event:{route:.2,coordination:.35},copy:'Strengthening protects standby capacity and execution readiness.'},{route:'activateAlternateRoute',coordination:'activateTransitionCapacity'}, {route:'responseAuthority',information:'responseAuthority',coordination:'responseAuthority'},{awareness:true,authority:true,capacity:'finite',execution:'conditional'}),
  liaison:C('coordinated-response.transition-guide','TRANSITION GUIDE',{CONNECT:2,TRUST:3,MOVE:1,UNDERSTAND:1},{route:.45,information:.35,coordination:.95},['coordinatorAvailable','boundedAuthority','availableAlternative'],{adds:['backupCoordinator','expandedEscalationAuthority'],event:{coordination:.3,route:.1,information:.1},copy:'Strengthening adds backup coordinator coverage and clearer escalation authority.'},{route:'coordinatorReroute',information:'coordinatorUpdate',coordination:'coordinatorIntervention'}, {route:'operationalCoordinator',information:'operationalCoordinator',coordination:'operationalCoordinator'},{awareness:true,authority:'bounded',capacity:false,execution:'humanDependent'})
 }};
export const eventDefinitions={route:{label:'ROUTE CHANGED',pressure:['MOVE','TRUST'],realized:{alternateRouteAvailable:true,staffAvailable:false,capacityAvailable:true}},information:{label:'PLAN CHANGED',pressure:['UNDERSTAND','CONNECT'],realized:{reviewerAvailable:true,planChangeConfirmed:false,downstreamParticipating:true}},coordination:{label:'HANDOFF CHANGED',pressure:['CONNECT','TRUST'],realized:{staffAvailable:true,capacityAvailable:false,downstreamParticipating:false}}};
export function canonicalChoice(a){return causalChoices[a?.capabilityId]?.[a?.commitmentId]||null}
export function dependencySet(state={}){let s=new Set(state.dependencies||[]);for(const a of state.activations||[]){let c=canonicalChoice(a);for(const x of c?.baselineReadiness||[])s.add(x);for(const x of a.operatingReadiness||a.operation?.readiness||[])s.add(x);if(a.strengthened)for(const x of c?.strengthen?.adds||[])s.add(x)}return s}
const explanation={
 'ambient.bedside.route':'The updated plan does not help Arthur interpret a closed route; wayfinding remains conventional.',
 'ambient.bedside.information':'Ambient intelligence captures the changed plan, while clinical verification determines whether Arthur can rely on it.',
 'ambient.bedside.coordination':'The plan can be updated, but it does not coordinate transport, family, and receiving-team handoffs.',
 'ambient.shared.route':'The review setting helps Arthur understand a detour only after route information reaches the conversation.',
 'ambient.shared.information':'Arthur and the care team can review and confirm the changed plan together; downstream continuity remains separate.',
 'ambient.shared.coordination':'Shared review improves understanding, but does not create transition capacity or cross-service authority.',
 'ambient.dedicated.route':'A transition guide can help interpret the changed path, subject to guide availability.',
 'ambient.dedicated.information':'A guide can carry revised plan context forward, but cannot independently make a clinical decision.',
 'ambient.dedicated.coordination':'A connected guide preserves context across handoffs, while staffing and handoff continuity remain critical.',
 'wayfinding.digital.route':'Personal guidance recalculates the route, but the physical environment may not confirm the detour.',
 'wayfinding.digital.information':'Digital wayfinding does not reconcile Arthur’s changed care or medication plan.',
 'wayfinding.digital.coordination':'The route can update, but the design does not coordinate transport, family, or receiving teams.',
 'wayfinding.layered.route':'Stable landmarks, physical cues, and responsive information make the alternate route understandable.',
 'wayfinding.layered.information':'Legible circulation helps Arthur move, but does not decide which version of the plan is correct.',
 'wayfinding.layered.coordination':'The environment supports movement after a decision, but does not create cross-service authority or capacity.',
 'wayfinding.escort.route':'A navigation guide gets Arthur through the changed route, provided coverage is available.',
 'wayfinding.escort.information':'A navigation guide can direct Arthur to help, but cannot reconcile the clinical plan.',
 'wayfinding.escort.coordination':'Human navigation supports the physical handoff, but not the wider operational coordination.',
 'meds.nurse.route':'Medication intelligence does not resolve Arthur’s changed physical route.',
 'meds.nurse.information':'The discrepancy becomes visible, but a qualified clinician must decide which medication plan is correct.',
 'meds.nurse.coordination':'Medication checking supports one part of the handoff, but does not coordinate the entire transition.',
 'meds.pharmacy.route':'Collaborative medication review does not create an alternate physical route.',
 'meds.pharmacy.information':'Arthur and a clinician or pharmacist establish and understand one authoritative medication plan.',
 'meds.pharmacy.coordination':'The confirmed medication plan improves the handoff, while transport and receiving-team coordination remain separate.',
 'meds.huddle.route':'Persistent medication information does not make the hospital route easier to navigate.',
 'meds.huddle.information':'The design can carry a confirmed plan forward, but connectivity cannot decide which conflicting record is correct.',
 'meds.huddle.coordination':'The authoritative medication plan remains available across participating settings; availability still does not guarantee action.',
 'command.unit.route':'The hospital can see a route problem, but awareness alone does not create an alternate path.',
 'command.unit.information':'Operational alerts can surface a plan conflict, but cannot clinically reconcile it.',
 'command.unit.coordination':'The hospital sees the handoff problem early, but awareness does not create authority or capacity.',
 'command.center.route':'The hospital can coordinate an appropriate alternate route when finite capacity and execution readiness align.',
 'command.center.information':'Operational coordination can bring the right people together, but clinical ownership must resolve the plan.',
 'command.center.coordination':'The hospital activates an appropriate alternative when authority, finite capacity, and execution readiness align.',
 'command.liaison.route':'An operational coordinator can arrange a route alternative if one is available.',
 'command.liaison.information':'A coordinator can connect Arthur to an accountable reviewer, but cannot replace clinical resolution.',
 'command.liaison.coordination':'An empowered coordinator intervenes across services, subject to bounded authority and available alternatives.'
};
export function causalExplanation(a,eventId){let c=canonicalChoice(a);return explanation[`${a.capabilityId}.${a.commitmentId}.${eventId}`]||`${c?.title||'The design'} contributes to the disruption while its operating dependencies remain active.`}
function hasClinicalEscalation(state){const owners=new Set(['planReviewer','transitionPlanOwner','clinicalResolver','medicationReviewer','medicationPlanOwner']);return (state.activations||[]).some(a=>owners.has(canonicalChoice(a)?.escalate?.information))}
function deriveReadiness(state,eventId,responseId,deps){
 const acts=state.activations||[];
 // A collaborative medication review establishes one authoritative plan. Strengthened AI Check does too.
 if(acts.some(a=>a.capabilityId==='meds'&&a.commitmentId==='pharmacy'))deps.add('authoritativeMedicationPlan');
 if(acts.some(a=>a.capabilityId==='meds'&&a.commitmentId==='nurse'&&a.strengthened))deps.add('authoritativeMedicationPlan');
 // A qualified escalation during Plan Changed can establish the authoritative plan.
 if(eventId==='information'&&responseId==='escalate'&&hasClinicalEscalation(state))deps.add('authoritativeMedicationPlan');
 return deps
}
export function responseEligibility(state,responseId,eventId){let choices=(state.activations||[]).map(canonicalChoice).filter(Boolean);if(responseId==='use')return{eligible:true,boost:0,why:'The funded design must hold without extra recovery capacity.'};if(responseId==='adapt'){let methods=choices.map(c=>c.adapt?.[eventId]).filter(Boolean);return methods.length?{eligible:true,boost:.65,why:`Adapt is available through ${methods.join(' + ')}.`}:{eligible:false,boost:0,why:`Adapt is unavailable because the portfolio created no alternate ${eventId==='route'?'route or navigation path':eventId==='information'?'review or information path':'space, handoff, or coordination path'}.`}}
 if(responseId==='escalate'){let recipients=choices.map(c=>c.escalate?.[eventId]).filter(Boolean);return recipients.length?{eligible:true,boost:.75,why:`Escalation can reach ${recipients.join(' + ')}. Success still depends on available capacity.`}:{eligible:false,boost:0,why:`Escalation is unavailable because no accountable ${eventId==='route'?'navigation or route owner':eventId==='information'?'clinical or plan owner':'transition or operational owner'} was designed.`}}return{eligible:false,boost:0,why:'Unknown response.'}}
function realizedAdjustment(a,eventId,realized){let delta=0,reasons=[];
 if(a.capabilityId==='meds'&&a.commitmentId==='huddle'&&eventId==='information'&&realized.planChangeConfirmed===false){delta-=.3;reasons.push('The discharge plan was confirmed, but the late change has not yet been clinically confirmed.')}
 if(a.capabilityId==='meds'&&a.commitmentId==='huddle'&&eventId==='coordination'&&realized.downstreamParticipating===false){delta-=.25;reasons.push('A downstream setting is not participating in the shared plan.')}
 if(a.capabilityId==='command'&&a.commitmentId==='center'&&realized.capacityAvailable===false){delta-=.4;reasons.push('The responsive operating model is designed, but no appropriate capacity remains available.')}
 if(['dedicated','escort','liaison'].includes(a.commitmentId)&&realized.staffAvailable===false){delta-=.3;reasons.push('The human support role is unavailable during this disruption.')}
 return{delta,reasons}}
export function choiceEffect(a,eventId,deps,realized={}){let c=canonicalChoice(a);if(!c)return{fit:0,causal:'Legacy choice is not mapped.'};let fit=c.events[eventId]||0;if(a.strengthened)fit+=c.strengthen?.event?.[eventId]||0;let adjustment=realizedAdjustment(a,eventId,realized);fit=Math.max(0,fit+adjustment.delta);return{fit,blocked:null,title:c.title,canonicalId:c.canonicalId,causal:causalExplanation(a,eventId),realizedReasons:adjustment.reasons,activation:a}}
function outcomeNarrative(effect,outcome,eventId){let potential=effect.causal,limits=effect.realizedReasons||[];if(outcome==='ABSORBED')return`${potential} The required conditions held well enough for Arthur to continue through the disruption.${limits.length?' Remaining constraint: '+limits.join(' '):''}`;if(outcome==='STRAINED')return`${potential} Arthur may need delay, added effort, or human support; this result does not establish a fully reliable transition.${limits.length?' '+limits.join(' '):''}`;return`${potential} The design could not provide a usable response in time, so Arthur absorbed the disruption.${limits.length?' '+limits.join(' '):''}`}
export function evaluatePortfolio(state={},eventId=state.eventId||'route',responseId=state.response||'use'){
 let deps=deriveReadiness(state,eventId,responseId,dependencySet(state)),realized={...(eventDefinitions[eventId]?.realized||{}),...(state.realizedReadiness||{})},effects=(state.activations||[]).map(a=>choiceEffect(a,eventId,deps,realized)),need={UNDERSTAND:0,MOVE:0,CONNECT:0,TRUST:0};
 for(const a of state.activations||[]){let c=canonicalChoice(a);for(const[k,v]of Object.entries(c?.needs||{}))need[k]=Math.min(3,need[k]+v)}
 let event=eventDefinitions[eventId],pressureAvg=event.pressure.reduce((n,k)=>n+need[k],0)/event.pressure.length,fit=effects.reduce((n,e)=>n+e.fit,0),response=responseEligibility(state,responseId,eventId),blocked=effects.filter(e=>e.blocked).length;
 // Calibrated after deterministic portfolio simulation: aligned choices can absorb; gaps remain exposed.
 let raw=pressureAvg*.58+fit+response.boost-blocked*.45;
 const readinessGaps=[];
 if(eventId==='information'){
  const medication=(state.activations||[]).some(a=>a.capabilityId==='meds');
  const reviewed=(state.activations||[]).some(a=>a.capabilityId==='ambient'&&a.commitmentId==='shared'||a.capabilityId==='meds'&&(a.commitmentId==='pharmacy'||a.commitmentId==='nurse'&&a.strengthened));
  const qualifiedEscalation=responseId==='escalate'&&response.eligible&&hasClinicalEscalation(state);
  const confirmed=realized.planChangeConfirmed===true||realized.reviewerAvailable===true&&(medication?deps.has('authoritativeMedicationPlan'):reviewed||qualifiedEscalation);
  if(!confirmed)readinessGaps.push('The changed plan has not been clinically resolved and confirmed. Detecting or forwarding a discrepancy does not establish one authoritative current plan.');
  if(realized.reviewerAvailable===false&&realized.planChangeConfirmed!==true)readinessGaps.push('The qualified reviewer is unavailable; a funded review path alone does not confirm this change.');
 }
 if(eventId!=='information'&&(state.activations||[]).some(a=>a.capabilityId==='command'&&a.commitmentId==='center')){
  if(realized.capacityAvailable===false)readinessGaps.push('Appropriate response capacity is unavailable in this scenario. Strengthen funds standby arrangements; it does not guarantee that a suitable resource is available.');
  else if(realized.capacityAvailable!==true)readinessGaps.push('Appropriate response capacity has not been established for this demand. Unknown capacity is not treated as unavailable, but cannot support a claim that the demand holds.');
 }
 // Readiness limits cap the numeric result too, so the composite cannot hide unresolved prerequisites.
 if(readinessGaps.length)raw=Math.min(raw,2.89);
 let outcome=raw>=2.9?'ABSORBED':raw>=1.3?'STRAINED':'EXPOSED';if(blocked&&outcome==='ABSORBED')outcome='STRAINED';
 effects=effects.map(e=>({...e,outcomeNarrative:outcomeNarrative(e,outcome,eventId)+(readinessGaps.length?' Remaining readiness: '+readinessGaps.join(' '):'')}));return{outcome,readinessGaps,raw:+raw.toFixed(2),scores:need,event,effects,response,dependencies:[...deps],designedReadiness:effects.map(e=>canonicalChoice(e.activation)?.baselineReadiness||[]).flat(),realizedReadiness:realized,vulnerabilities:event.pressure.filter(k=>need[k]<2),causalSummary:effects.map(e=>e.outcomeNarrative)}
}
export function strengthenCopy(a){return canonicalChoice(a)?.strengthen?.copy||'Strengthening reinforces the selected design’s stated vulnerability.'}
export function compareEvaluations(before,after){let rank={EXPOSED:0,STRAINED:1,ABSORBED:2},delta=rank[after.outcome]-rank[before.outcome];return{classificationChanged:delta!==0,delta,before:before.outcome,after:after.outcome,whatChanged:after.causalSummary.filter(x=>!before.causalSummary.includes(x)),summary:delta>0?'The revised design improved how Arthur experienced the same disruption.':delta<0?'The revised design removed protection Arthur previously relied on.':'The headline result stayed the same, but the causal path and remaining dependency changed.'}}
