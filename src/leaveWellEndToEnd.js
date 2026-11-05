export const leaveWellVisuals={
 ambient:'capability-ambient.png',wayfinding:'capability-wayfinding.png',meds:'capability-meds.png',command:'capability-command.png',baseline:'storyboard-baseline.png'
};
export const needWeights={
 ambient:{UNDERSTAND:3,MOVE:0,CONNECT:2,TRUST:2},
 wayfinding:{UNDERSTAND:1,MOVE:3,CONNECT:0,TRUST:2},
 meds:{UNDERSTAND:2,MOVE:0,CONNECT:3,TRUST:2},
 command:{UNDERSTAND:1,MOVE:1,CONNECT:3,TRUST:2}
};
const labels={ambient:'Ambient Discharge + Handoff',wayfinding:'Adaptive Wayfinding',meds:'Medication Reconciliation',command:'Command + Coordination'};
const visibleChange={
 ambient:'The discharge conversation becomes a transition plan Arthur can carry forward.',
 wayfinding:'Digital, physical and human guidance can adapt as the route changes.',
 meds:'Medication discrepancies become visible and can be reconciled before departure.',
 command:'Transition constraints become visible across departments so a response can be coordinated.'
};
export function needScores(activations=[]){
 const score={UNDERSTAND:0,MOVE:0,CONNECT:0,TRUST:0};
 activations.forEach(a=>Object.entries(needWeights[a.capabilityId]||{}).forEach(([k,v])=>score[k]+=v));
 Object.keys(score).forEach(k=>score[k]=Math.min(3,score[k]));
 return score;
}
export function strategyChoice(state,affordable){
 return {canStrengthen:state.activations.length===1,canExtend:state.activations.length===1&&affordable.length>0};
}
export function strengthenCurrent(state){
 const a=state.activations[0]; if(!a)return state;
 return {...state,strategy:'strengthen',activations:[{...a,strengthened:true}],capital:Math.max(0,state.capital-1),change:Math.max(0,state.change-1)};
}
export function extendJourney(state){return {...state,strategy:'extend'};}
export function storyboardModel(state,stage='baseline'){
 const scores=needScores(state.activations);
 const selected=state.activations.map(a=>({id:a.capabilityId,name:labels[a.capabilityId],change:visibleChange[a.capabilityId],designed:!!a.choice,operational:!!a.operation,strengthened:!!a.strengthened}));
 return {stage,scores,selected,vulnerabilities:Object.entries(scores).filter(([,v])=>v<2).map(([k])=>k)};
}
export function storyboardHTML(state,stage='baseline',asset=(n)=>`./assets/${n}`){
 const m=storyboardModel(state,stage),dots=n=>'●'.repeat(n)+'○'.repeat(3-n);
 return `<section class="lw-storyboard"><div class="lw-scene"><img src="${asset(leaveWellVisuals.baseline)}" alt="Arthur's hospital to home transition"><div class="lw-scene-title"><span>${stage==='baseline'?'TODAY':'YOUR DESIGN'}</span><strong>${stage==='baseline'?'A credible transition with familiar vulnerabilities.':'The environment changes because the team invested.'}</strong></div>${m.selected.map((x,i)=>`<article class="lw-overlay lw-overlay-${x.id}" style="--i:${i}"><b>${x.operational?'DESIGNED + OPERATIONAL':x.designed?'DESIGNED':'ACTIVATED'}</b><span>${x.name}</span><small>${x.change}</small></article>`).join('')}</div><div class="lw-needs">${Object.entries(m.scores).map(([k,v])=>`<div class="${v<2?'vulnerable':''}"><b>${k}</b><span>${dots(v)}</span></div>`).join('')}</div>${m.vulnerabilities.length?`<div class="lw-gap"><b>STILL VULNERABLE</b><span>${m.vulnerabilities.join(' · ')}</span></div>`:''}</section>`;
}
export function outcomeFromFourNeeds(state,pressureNeed='MOVE'){
 const scores=needScores(state.activations),pressure=scores[pressureNeed]||0,average=Object.values(scores).reduce((a,b)=>a+b,0)/4;
 const ops=state.activations.reduce((n,a)=>n+(a.operation?.effect||0),0),strength=state.activations.some(a=>a.strengthened)?1:0;
 const raw=pressure+average/2+strength-ops;
 return {classification:raw>=4?'ABSORBED':raw>=2.5?'STRAINED':'EXPOSED',scores,pressureNeed};
}
