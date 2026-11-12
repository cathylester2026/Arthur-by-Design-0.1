// Back/Next reviews visited screens only; it never replays a purchase or alters a saved decision.
export function createReviewNavigation(root,{key,liveRender,storage=globalThis.sessionStorage}={}){
 let frames=[],cursor=-1;
 try{frames=JSON.parse(storage?.getItem(key)||'[]');if(!Array.isArray(frames))frames=[]}catch{}
 function controls(review){const nav=document.createElement('nav');nav.className='solo-review-navigation';nav.setAttribute('aria-label','Review your progress');nav.innerHTML=`<button data-review-back ${cursor<=0?'disabled':''}>← Back</button>${review?'<span>Earlier screen · your saved choices stay in place.</span><button data-review-next>Next →</button>':'<span>Review your earlier screens at any time.</span>'}`;root.appendChild(nav);nav.querySelector('[data-review-back]').onclick=()=>show(cursor-1);nav.querySelector('[data-review-next]')?.addEventListener('click',()=>show(cursor+1));}
 function show(index){if(index<0||index>=frames.length)return;cursor=index;if(index===frames.length-1){liveRender();return}root.innerHTML=frames[index].html;root.querySelectorAll('button,input,select,textarea').forEach(x=>x.disabled=true);controls(true);globalThis.scrollTo?.(0,0)}
 return {present(id){root.querySelectorAll('.solo-review-navigation').forEach(n=>n.remove());const html=root.innerHTML;if(frames.at(-1)?.id===id)frames[frames.length-1]={id,html};else frames.push({id,html});frames=frames.slice(-40);cursor=frames.length-1;try{storage?.setItem(key,JSON.stringify(frames))}catch{}controls(false)}};
}
