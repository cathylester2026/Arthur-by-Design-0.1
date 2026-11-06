const DATA={
 nurse:{
  title:'AI CHECK FIRST',headline:'YOU EMBEDDED AI INTO THE EXISTING WORKFLOW.',image:'design-meds-ai-check-first.png',
  change:'Detection is stronger. The environment and clinical workflow remain largely unchanged.',
  statuses:[['?','UNDERSTAND','green','STRONGER'],['→','MOVE','red','EXPOSED'],['∞','CONNECT','yellow','PARTIAL'],['✓','TRUST','yellow','PARTIAL']],
  arthur:'A medication conflict has a better chance of being caught before Arthur takes it home.',
  people:'The care team still needs time, ownership and clinical judgment to review and resolve the discrepancy.',
  environment:'The existing discharge setting remains. AI appears at the point of work with privacy-conscious screen positioning and sightlines that keep Arthur included.',
  boundary:'No protected consultation setting, downstream continuity or automatic resolution was earned.',
  insight:'Better information improves safety, but people, process and time still determine whether the discrepancy is resolved.'
 },
 pharmacy:{
  title:'REVIEW TOGETHER',headline:'YOU CREATED A PLACE TO RESOLVE IT TOGETHER.',image:'design-meds-review-together.png',
  change:'Arthur, a support person and the care team can review and confirm one medication plan in a protected setting.',
  statuses:[['?','UNDERSTAND','green','STRONG'],['→','MOVE','red','EXPOSED'],['∞','CONNECT','yellow','PARTIAL'],['✓','TRUST','green','STRONG']],
  arthur:'Arthur can see what changed, ask why and participate in confirming the medication plan.',
  people:'A qualified clinician or pharmacist, protected review time and accountable ownership are still required.',
  environment:'Acoustic and visual privacy, inclusive seating, shared information and fewer interruptions make collaborative review possible.',
  boundary:'Downstream continuity, medication delivery and home monitoring remain separate capabilities.',
  insight:'Accuracy becomes trust when Arthur can participate in the decision.'
 },
 huddle:{
  title:'PLAN FOLLOWS ARTHUR',headline:'YOU DESIGNED CONTINUITY BEYOND THE ROOM.',image:'design-meds-plan-follows.png',
  change:'A confirmed medication plan can remain available as Arthur moves from hospital to pharmacy, home and follow-up care.',
  statuses:[['?','UNDERSTAND','green','STRONG'],['→','MOVE','yellow','PARTIAL'],['∞','CONNECT','green','STRONG'],['✓','TRUST','green','STRONG']],
  arthur:'Arthur leaves with one confirmed medication plan that participating care settings can use.',
  people:'Someone must maintain the authoritative plan and resolve changes before information is carried forward.',
  environment:'The design extends across hospital, home and follow-up settings through resilient, authorized information access.',
  boundary:'Availability does not guarantee downstream participation, clinical action, medication delivery or perfect interoperability.',
  insight:'A confirmed plan becomes more useful when it can follow Arthur across care settings.'
 }
};
export function medicationDesignRevealHTML({choiceId,asset}){
 const d=DATA[choiceId];if(!d)return'';
 return `<section class="med-design-reveal"><div class="med-design-kicker">DESIGN DECISION → IMPACT</div><h1>${d.headline}</h1><div class="med-design-name">MEDICATION CHECK · ${d.title}</div><img class="med-design-image" src="${asset(d.image)}" alt="${d.title} design-impact reveal"><div class="med-design-change"><span>WHAT YOUR DESIGN CHANGED</span><strong>${d.change}</strong></div><section class="need-impact">${d.statuses.map(([icon,name,color,status])=>`<article class="${color}"><b><i>${icon}</i> ${name}</b><strong>● ${status}</strong></article>`).join('')}</section><div class="arthur-impact"><span>FOR ARTHUR</span><strong>${d.arthur}</strong></div><details class="med-learn"><summary>WHY THIS MATTERS · LEARN MORE</summary><div class="med-learn-grid"><p><b>PEOPLE + OPERATIONS</b><br>${d.people}</p><p><b>BUILT ENVIRONMENT</b><br>${d.environment}</p><p><b>STILL NOT EARNED</b><br>${d.boundary}</p><p><b>DESIGN PATH</b><br>${d.title}</p></div></details><div class="design-insight"><span>DESIGN INSIGHT</span><strong>${d.insight}</strong></div><button type="button" data-med-design-next>REVIEW YOUR DESIGN →</button></section>`;
}
export function bindMedicationDesignReveal(root,onNext){root.querySelector('[data-med-design-next]')?.addEventListener('click',()=>onNext?.())}
