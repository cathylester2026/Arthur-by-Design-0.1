// Medication Check capability-investment before->after reveal.
export function medicationInvestmentTransition({asset,escape}){
 const E=escape||((x)=>String(x??''));
 return `<section class="med-invest-transition" data-med-transition>
  <div class="med-transition-stage" aria-live="polite">
   <img class="med-state before is-active" src="${asset('medication-check-before.png')}" alt="Care team manually comparing medication information from several paper and electronic sources">
   <img class="med-state after" src="${asset('medication-check-activated.png')}" alt="Medication Check compares available sources and surfaces a potential discrepancy for clinical review">
   <div class="med-transition-copy before-copy"><span>BEFORE</span><strong>The information exists. The conflict is hard to see.</strong></div>
   <div class="med-transition-copy after-copy"><span>TECHNOLOGY CHANGED WHAT IS POSSIBLE</span><strong>MEDICATION CHECK ACTIVATED</strong><small>Potential medication discrepancy · Review required</small></div>
   <button type="button" class="med-skip" data-med-skip>SKIP ANIMATION</button>
  </div>
  <div class="med-transition-impact" hidden data-med-impact>
   <section class="need-impact">
    <article class="green"><b><i>?</i> UNDERSTAND</b><strong>● STRONG</strong></article>
    <article class="red"><b><i>→</i> MOVE</b><strong>● EXPOSED</strong></article>
    <article class="yellow"><b><i>∞</i> CONNECT</b><strong>● PARTIAL</strong></article>
    <article class="yellow"><b><i>✓</i> TRUST</b><strong>● PARTIAL</strong></article>
   </section>
   <div class="arthur-impact"><span>FOR ARTHUR</span><strong>A medication conflict has a better chance of being caught before Arthur takes it home.</strong></div>
   <details class="med-learn"><summary>WHY THIS MATTERS · LEARN MORE</summary><div class="med-learn-grid"><p><b>FOR ARTHUR</b><br>Potential medication conflicts become visible before departure.</p><p><b>PEOPLE + OPERATIONS</b><br>Someone still needs to review, resolve, explain and own the discrepancy.</p><p><b>BUILT ENVIRONMENT</b><br>The next design choice determines where and how reconciliation actually happens.</p><p><b>RESOURCES</b><br>3 Capital · 3 Change</p></div></details>
   <div class="design-insight"><span>DESIGN INSIGHT</span><strong>Finding the discrepancy is a technology function. Resolving it is a design and operating decision.</strong></div>
   <button type="button" data-med-next>NOW DESIGN AROUND IT →</button>
  </div>
 </section>`
}
export function runMedicationInvestmentTransition(root,{onNext,durationBefore=1600,durationCrossfade=650}={}){
 const box=root.querySelector('[data-med-transition]');if(!box)return;
 const before=box.querySelector('.before'),after=box.querySelector('.after'),beforeCopy=box.querySelector('.before-copy'),afterCopy=box.querySelector('.after-copy'),impact=box.querySelector('[data-med-impact]'),skip=box.querySelector('[data-med-skip]');
 let timers=[];const later=(fn,ms)=>{let t=setTimeout(fn,ms);timers.push(t)};
 const finish=()=>{timers.forEach(clearTimeout);timers=[];before.classList.remove('is-active');after.classList.add('is-active');beforeCopy.classList.add('is-hidden');afterCopy.classList.add('is-active');skip.hidden=true;later(()=>{impact.hidden=false;impact.classList.add('is-active')},180)};
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)finish();else{later(()=>{before.classList.add('is-fading');after.classList.add('is-active');beforeCopy.classList.add('is-hidden')},durationBefore);later(()=>{afterCopy.classList.add('is-active');skip.hidden=true;impact.hidden=false;impact.classList.add('is-active')},durationBefore+durationCrossfade)}
 skip?.addEventListener('click',finish,{once:true});box.querySelector('[data-med-next]')?.addEventListener('click',()=>onNext?.());
}
