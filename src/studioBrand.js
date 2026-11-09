import './studioBrand.css';
import './flowPolish.css';

export function applyStudioBrand(root=document){
 if(document.documentElement&&!document.documentElement.classList.contains('arthur-studio-doc'))document.documentElement.classList.add('arthur-studio-doc');
 if(document.body&&!document.body.classList.contains('arthur-studio-app'))document.body.classList.add('arthur-studio-app');
 root.querySelectorAll('main.phone,main.host').forEach(el=>{if(!el.classList.contains('arthur-studio'))el.classList.add('arthur-studio')});
}
if(typeof document!=='undefined'){
 applyStudioBrand();
 if(typeof MutationObserver!=='undefined')new MutationObserver(()=>applyStudioBrand()).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
}
