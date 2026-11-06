const VISUALS={
 nurse:{image:'design-meds-ai-check-first.png',label:'AI CHECK FIRST'},
 pharmacy:{image:'design-meds-review-together.png',label:'REVIEW TOGETHER'},
 huddle:{image:'design-meds-plan-follows.png',label:'PLAN FOLLOWS ARTHUR'}
};
export function medicationPortfolioVisualHTML(state,asset,{allowWhenExtended=false}={}){
 const acts=state?.activations||[];
 if(!allowWhenExtended&&acts.length!==1)return'';
 const a=acts.find(x=>x.capabilityId==='meds');
 if(!a)return'';
 const v=VISUALS[a.commitmentId];if(!v)return'';
 return `<section class="selected-design-visual"><img src="${asset(v.image)}" alt="${v.label} selected design"><div class="selected-design-caption"><span>YOUR SELECTED DESIGN</span><strong>${v.label}</strong>${a.strengthened?'<em>STRENGTHENED</em>':''}</div>${a.strengthened?`<div class="strengthened-band"><b>DESIGN STRENGTHENED</b><span>The same design is retained. Its operating readiness and fallback capacity are reinforced.</span></div>`:''}</section>`;
}
