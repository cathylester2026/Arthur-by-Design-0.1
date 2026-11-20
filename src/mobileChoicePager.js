// Phone-only choice paging. The actual decision buttons and engine remain unchanged.
// A single option occupies the phone viewport; desktop/facilitator layouts keep full grids.
export function mountMobileChoicePager(root,{selector='.cards',maxWidth=700}={}){
 const list=[...root.querySelectorAll(selector)].filter(grid=>grid.querySelectorAll(':scope > article').length>1);
 for(const grid of list){
  if(grid.dataset.pagerMounted)return;
  grid.dataset.pagerMounted='1';
  const items=[...grid.querySelectorAll(':scope > article')];
  let current=0;
  const controls=document.createElement('nav');controls.className='mobile-choice-pager';controls.setAttribute('aria-label','Browse design choices');
  const before=document.createElement('button');before.type='button';before.className='secondary';before.textContent='← Previous';
  const after=document.createElement('button');after.type='button';after.className='secondary';after.textContent='Next option →';
  const count=document.createElement('span');count.setAttribute('role','status');count.setAttribute('aria-live','polite');
  controls.append(before,count,after);grid.insertAdjacentElement('afterend',controls);
  function update(){
   const mobile=window.matchMedia('(max-width: '+maxWidth+'px)').matches;
   grid.classList.toggle('mobile-paged-choices',mobile);
   controls.hidden=!mobile;
   items.forEach((item,i)=>{item.hidden=mobile&&i!==current;if(mobile)item.setAttribute('aria-hidden',i===current?'false':'true');else item.removeAttribute('aria-hidden');});
   count.textContent='Option '+(current+1)+' of '+items.length;
   before.disabled=current===0;after.disabled=current===items.length-1;
  }
  before.addEventListener('click',()=>{current=Math.max(0,current-1);update();grid.scrollIntoView({block:'start',behavior:'instant'})});
  after.addEventListener('click',()=>{current=Math.min(items.length-1,current+1);update();grid.scrollIntoView({block:'start',behavior:'instant'})});
  window.addEventListener('resize',update,{passive:true});update();
 }
}
