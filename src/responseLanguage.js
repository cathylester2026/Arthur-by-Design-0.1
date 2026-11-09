// Descriptions for people playing the game. IDs remain stable in the rules.
const paths={
 updatePlan:'a review and update of Arthur’s plan',
 protectedReview:'protected time to review the changed plan together',
 mobileGuide:'a transition guide who can meet Arthur where he is',
 resequenceHandoff:'a revised handoff sequence with the transition guide',
 recalculate:'an updated digital route',
 responsiveGuidance:'updated signs and guidance along the route',
 guideReroute:'a guide who can help Arthur take another route',
 rerouteAlert:'a route-change alert to the responsible team',
 protectedMedicationReview:'protected time for a medication review',
 alternatePlanAccess:'another way to access the confirmed medication plan',
 activateAlternateRoute:'an alternative departure route',
 activateTransitionCapacity:'another available transition space or support resource',
 coordinatorReroute:'a coordinator who can rearrange the route',
 coordinatorUpdate:'a coordinator who can pass on the changed plan',
 coordinatorIntervention:'a coordinator who can intervene in the handoff'
};
const people={
 planReviewer:'the person assigned to review Arthur’s plan',
 transitionPlanOwner:'the person accountable for Arthur’s transition plan',
 transitionGuide:'Arthur’s transition guide',
 wayfindingOwner:'the team responsible for wayfinding',
 routeGovernanceOwner:'the person authorized to manage route changes',
 navigationGuide:'a person who can guide Arthur along the route',
 clinicalResolver:'a clinician authorized to resolve the medication discrepancy',
 medicationReviewer:'the clinician or pharmacist assigned to review medications',
 medicationPlanOwner:'the person accountable for the current medication plan',
 escalationOwner:'the person assigned to receive and act on an escalation',
 responseAuthority:'the person authorized to arrange additional response support',
 operationalCoordinator:'the coordinator responsible for the transition'
};
export function responsePathLabel(id,kind){return (kind==='escalate'?people:paths)[id]||'the funded support path'}
export function responseList(ids,kind){const names=[...new Set(ids.map(id=>responsePathLabel(id,kind)))];return names.length<2?names[0]||'the funded support path':names.slice(0,-1).join(', ')+' and '+names.at(-1)}
