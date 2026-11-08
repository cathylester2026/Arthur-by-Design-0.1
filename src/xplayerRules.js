// Arthur: By Design - shared facilitated rules contract.
// Pure functions only: safe to regression-test without Supabase or the DOM.
export const STARTING_BUDGET={capital:7,change:6};
export const CAPABILITY_COSTS={ambient:{capital:3,change:2},wayfinding:{capital:2,change:2},meds:{capital:3,change:3},command:{capital:5,change:5}};
export const STRENGTHEN_COST={capital:1,change:1};
export function budgetOf(team={}){return{capital:Number(team.capital??STARTING_BUDGET.capital),change:Number(team.change_budget??STARTING_BUDGET.change)}}
export function costOf(choice){return CAPABILITY_COSTS[choice]||null}
export function canAfford(team,choice){let b=budgetOf(team),c=costOf(choice);return!!c&&b.capital>=c.capital&&b.change>=c.change}
export function affordableChoices(team){return Object.keys(CAPABILITY_COSTS).filter(id=>canAfford(team,id))}
export function spendCapability(team,choice){let c=costOf(choice);if(!c)throw new Error(`Unknown capability: ${choice}`);if(!canAfford(team,choice))throw new Error(`${choice} is not affordable: requires ${c.capital} Capital and ${c.change} Change`);let b=budgetOf(team);return{capital:b.capital-c.capital,change_budget:b.change-c.change}}
export function canStrengthen(team){let b=budgetOf(team);return b.capital>=1&&b.change>=1}
export function voteDistribution(votes,teamId,key){return votes.filter(v=>v.team_id===teamId&&v.decision===key).reduce((a,v)=>(a[v.choice]=(a[v.choice]||0)+1,a),{})}
export function evaluateTable(team,eventId='handoff_changed'){
 const investments=team.investments||[];
 const caps=new Set(investments.map(i=>i.capabilityId));
 const designs=new Set(investments.map(i=>`${i.capabilityId}:${i.commitmentId}`));
 const strengthened=investments.some(i=>i.strengthened);
 let score=0,reasons=[],exposures=[];
 if(caps.has('ambient')){score+=1;reasons.push('One take-home plan supports understanding')}
 if(caps.has('wayfinding')){score+=1;reasons.push('Adaptive guidance supports movement')}
 if(caps.has('meds')){score+=1;reasons.push('Medication reconciliation reduces conflicting instructions')}
 if(caps.has('command')){score+=2;reasons.push('Coordinated response supports disrupted handoffs')}
 if([...designs].some(x=>/shared|pharmacy|center|layered/.test(x))){score+=1;reasons.push('The design integrates people, place and information')}
 if(strengthened){score+=1;reasons.push('Funded backup support improves resilience')}
 if(eventId==='handoff_changed'&&!caps.has('command'))exposures.push('No funded coordination capability owns the changed handoff');
 if(!caps.has('meds'))exposures.push('Medication information may fragment across settings');
 if(!caps.has('ambient'))exposures.push('Arthur may not leave with one understandable plan');
 let outcome=score>=5?'HOLDS':score>=3?'STRAINED':'EXPOSED';
 return{outcome,score,reasons,exposures,eventId};
}
