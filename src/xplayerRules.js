import { evaluatePortfolio, responseEligibility as causalResponse } from './causalEngine.js';
export const STARTING_BUDGET={capital:7,change:6};
export const CAPABILITY_COSTS={ambient:{capital:3,change:2},wayfinding:{capital:2,change:2},meds:{capital:3,change:3},command:{capital:5,change:5}};
export const STRENGTHEN_COST={capital:1,change:1};
export const RESPONSE_COSTS={use:{capital:0,change:0},adapt:{capital:0,change:1},escalate:{capital:1,change:1}};
export function budgetOf(t={}){return {capital:Number(t.capital??7),change:Number(t.change_budget??6)}}
export function costOf(id){return CAPABILITY_COSTS[id]||null}
export function canAfford(t,id){const b=budgetOf(t),c=costOf(id);return !!c&&b.capital>=c.capital&&b.change>=c.change}
export function affordableChoices(t){return Object.keys(CAPABILITY_COSTS).filter(id=>canAfford(t,id))}
export function spendCapability(t,id){const c=costOf(id),b=budgetOf(t);if(!c||!canAfford(t,id))throw Error(`${id} is not affordable`);return {capital:b.capital-c.capital,change_budget:b.change-c.change}}
export function canStrengthen(t){const b=budgetOf(t);return b.capital>=1&&b.change>=1}
export function voteDistribution(votes,teamId,key){return votes.filter(v=>v.team_id===teamId&&v.decision===key).reduce((a,v)=>(a[v.choice]=(a[v.choice]||0)+1,a),{})}
const demands=[['route','Movement and departure'],['information','Current plan'],['coordination','Handoff ownership']];
const stateOf=t=>({activations:t.investments||[]});
export function responseEligibility(t){
  const b=budgetOf(t),state=stateOf(t),result={};
  for(const [id,cost] of Object.entries(RESPONSE_COSTS)){
    const methods=demands.map(([event])=>causalResponse(state,id,event)).filter(x=>x.eligible);
    const capacity=b.capital>=cost.capital&&b.change>=cost.change;
    result[id]={ok:capacity&&methods.length>0,cost,why:!capacity?'Insufficient remaining Capital / Change.':methods.length? id==='use'?'Rely on the operating commitments already funded.':methods.map(x=>x.why).filter((v,i,a)=>a.indexOf(v)===i).join(' '):'Your design created no usable response path for this action.'};
  }
  return result;
}
export function spendResponse(t,id){const e=responseEligibility(t)[id],b=budgetOf(t);if(!e?.ok)throw Error(e?.why||'Unknown response');return {capital:b.capital-e.cost.capital,change_budget:b.change-e.cost.change}}
export function evaluateTable(t,eventId='handoff_changed',responseId='use'){
  const state=stateOf(t),details=demands.map(([id,label])=>({id,label,...evaluatePortfolio(state,id,responseId)}));
  const score=+(details.reduce((n,d)=>n+d.raw,0)/details.length).toFixed(2);
  const exposed=details.some(d=>d.outcome==='EXPOSED');
  const unresolved=details.some(d=>d.readinessGaps?.length);
  const outcome=score>=2.9&&!exposed&&!unresolved?'HOLDS':score>=1.3?'STRAINED':'EXPOSED';
  const reasons=details.flatMap(d=>d.effects.filter(e=>e.fit>=.6&&!e.realizedReasons?.length&&d.outcome==='ABSORBED').map(e=>`${d.label}: ${e.causal}`));
  const exposures=details.filter(d=>d.outcome!=='ABSORBED').map(d=>`${d.label} remains ${d.outcome.toLowerCase()}: ${[...(d.readinessGaps||[]),...d.effects.flatMap(e=>e.realizedReasons)].filter((x,i,a)=>a.indexOf(x)===i).join(' ')||'The funded design and response do not fully cover this demand.'}`);
  return {outcome,score,reasons,exposures,eventId,responseId,details,model:'causal-composite-readiness-v2'};
}

export function budgetConsequence(t,action,id){
 let next;try{next=action==='invest'?{...t,...spendCapability(t,id)}:{...t,capital:t.capital-STRENGTHEN_COST.capital,change_budget:t.change_budget-STRENGTHEN_COST.change};}catch{return ''}
 if(next.capital<0||next.change_budget<0)return '';
 const strengthenWarning=action==='invest'&&next.capital>=1&&next.change_budget===1?' If you then Strengthen, only Use will remain affordable.':'';
 const b=budgetOf(next),budgetActions=Object.entries(RESPONSE_COSTS).filter(([,c])=>b.capital>=c.capital&&b.change>=c.change).map(([k])=>k==='use'?'Use':k==='adapt'?'Adapt':'Escalate');
 return `After ${action==='invest'?'this investment':'Strengthen'}: ${b.capital} Capital / ${b.change} Change. ${budgetActions.length===1?'Your remaining budget will allow only Use at the response stage.':`Budget can cover ${budgetActions.join(', ')}; actual availability also depends on your design and any later spending.`}${strengthenWarning}`;
}
