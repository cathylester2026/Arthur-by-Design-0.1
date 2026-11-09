import './phoneFinalReveal.css';
import {CAPABILITIES,RESPONSES,asset} from './leaveWellExperience.js';
import {ARCHITECTURAL_BASELINE} from './leaveWellArchitecturalBaseline.js';
import {resolveArchitecturalFeatures} from './architectureFeatureResolver.js';
import {evaluate} from './parityEngine.js';
import {escapeHTML as e} from './perspectivePrompts.js';
import {PRE_RENDERED_VIDEOS} from './leaveWellVideoManifest.js';
const IDS={ambient:{bedside:'SD1A',shared:'SD1B',dedicated:'SD1C'},wayfinding:{digital:'SR2A',layered:'SR2B',escort:'SR2C'},meds:{nurse:'MC3A',pharmacy:'MC3B',huddle:'MC3C'},command:{unit:'CR4A',center:'CR4B',liaison:'CR4C'}};
const ORDER=['ambient','wayfinding','meds','command'];
const mounted=new WeakMap(),positions=new Map();
export function phoneVideoKey(investments=[]){
 const selected=[...investments].sort((a,b)=>ORDER.indexOf(a.capabilityId)-ORDER.indexOf(b.capabilityId));
 if(selected.length<1||selected.length>2||new Set(selected.map(i=>i.capabilityId)).size!==selected.length)return null;
 if(selected.length===2&&selected.some(i=>i.strengthened))return null;
 const keys=selected.map(i=>IDS[i.capabilityId]?.[i.commitmentId]);if(keys.some(k=>!k))return null;
 return keys.length===2?keys.join('+'):keys[0]+(selected[0].strengthened?'-S':'');
}
export function configuredFilm(team){
 const key=phoneVideoKey(team.investments),src=key&&PRE_RENDERED_VIDEOS[key];if(typeof src!=='string'||!src)return null;
 const base=typeof location!=='undefined'?location.href:'https://example.test/';let url;try{url=new URL(src,base)}catch{return null}
 if(!['http:','https:','file:'].includes(url.protocol)||!url.pathname.toLowerCase().endsWith('.mp4'))return null;
 return {key,src};
}
export function predictionText(value){
 if(typeof value==='string')return value;
 if(value?.label)return String(value.label);
 if(value?.counts)return Object.entries(value.counts).map(([k,v])=>k+' '+v).join(' · ');
 return 'Not recorded';
}
export function buildPhoneStory(team,{player,votes=[]}={}){
 const inv=team.investments||[],evaluation=team.game_state?.evaluation||evaluate(team),response=team.game_state?.responseId||'use',cost=team.game_state?.resourceCost||{capital:0,change:0};
 const mine=votes.find(v=>v.player_id===player?.id&&v.team_id===team.id&&v.decision==='prediction');
 const slides=[{id:'arthur',eyebrow:'YOUR LEAVE WELL STORY',title:'SAME ARTHUR. YOUR TABLE’S DESIGN.',image:'arthur-leave-well.png',body:'Arthur is preparing to leave hospital after cardiac surgery. Your table chose what would help him understand the plan, move safely, stay connected and know who can respond.'}];
 inv.forEach((i,index)=>{const c=CAPABILITIES[i.capabilityId],o=c?.options?.[i.commitmentId],id=IDS[i.capabilityId]?.[i.commitmentId];if(!c||!o||!id)return;const b=ARCHITECTURAL_BASELINE[id.slice(-2)];slides.push({id:'investment-'+index,eyebrow:'INVESTMENT '+(index+1)+' · '+c.title,title:o[0],image:o[1],strengthened:i.strengthened===true,body:o[2],limit:b?.['PRIMARY VULNERABILITY']||o[3],architecture:b?.['SPACE + CONFIGURATION / ENVIRONMENT']||o[3]})});
 if(inv.length>1){const f=resolveArchitecturalFeatures({activations:inv});slides.push({id:'portfolio',eyebrow:'YOUR COMBINED DESIGN',title:'ONE CONNECTED JOURNEY.',body:f.enabled.includes('shared_adaptable_transition_setting')?'Your choices can share one adaptable consultation setting for discharge understanding and medication review. The space can be shared; clinical ownership, staffing and scheduling still need to be arranged.':'Your two capabilities support different parts of Arthur’s journey. They add to one another without automatically resolving each other’s staffing, authority or operating dependencies.',labels:inv.map(i=>CAPABILITIES[i.capabilityId]?.title).filter(Boolean)})}
 slides.push({id:'disruption',eyebrow:'THE DISRUPTION',title:'THREE THINGS CHANGED.',body:'Transport arrived 20 minutes early. Arthur’s family contact was unavailable. The receiving team still had the original plan.',prediction:predictionText(team.game_state?.prediction),myPrediction:mine?.choice});
 slides.push({id:'response',eyebrow:'YOUR TABLE’S RESPONSE',title:RESPONSES[response]?.[0]||'RESPONSE NOT RECORDED',body:RESPONSES[response]?.[1]||'Review your funded design and remaining dependencies.',cost,remaining:{capital:team.capital,change:team.change_budget},automatic:/random|default|fallback|automatic/.test(team.game_state?.last_decision?.source||'')});
 slides.push({id:'outcome',eyebrow:'PERFORMANCE UNDER PRESSURE',title:evaluation.outcome,body:'This is how the prototype evaluated your design against the same disruption.',evaluation});
 const film=configuredFilm(team);if(film)slides.push({id:'film',eyebrow:'YOUR DESIGNED FUTURE',title:'YOUR TABLE’S ARCHITECTURAL FILM.',film,poster:inv[0]&&CAPABILITIES[inv[0].capabilityId]?.options?.[inv[0].commitmentId]?.[1],body:'This pre-rendered film shows your selected architectural design. Your actual response and outcome are shown separately in this story.'});
 slides.push({id:'reflection',eyebrow:'USEFUL · RESILIENT · HUMAN',title:'WHAT CAN ARTHUR NOW RELY ON?',body:'AI created possibilities. Your choices shaped what Arthur could use—and what still depends on people, place and operations.',labels:['UNDERSTAND','MOVE','CONNECT','TRUST'],closing:true});
 return slides;
}
function fingerprint(team){return JSON.stringify({investments:(team.investments||[]).map(i=>[i.capabilityId,i.commitmentId,!!i.strengthened]),response:team.game_state?.responseId,evaluation:team.game_state?.evaluation})}
function positionKey(ctx){return 'abd-phone-story:'+ctx.session.id+':'+ctx.player.id+':'+ctx.team.id+':'+fingerprint(ctx.team)}
function loadPosition(key){let value;try{value=Number(sessionStorage.getItem(key)||0)}catch{value=positions.get(key)||0}return Number.isInteger(value)&&value>=0?value:0}
function savePosition(key,index){positions.set(key,index);try{sessionStorage.setItem(key,String(index))}catch{}}
function detailsHTML(v){const demands=v.details||[];return `<div class="reveal-demands">${demands.map(d=>`<p><b>${e(d.label)}</b><span>${e(d.outcome==='ABSORBED'?'HOLDS':d.outcome)}</span></p>`).join('')}</div><details><summary>WHAT HELD / WHAT REMAINED EXPOSED</summary><h3>WHAT HELD</h3>${(v.reasons||[]).map(x=>`<p>✓ ${e(x)}</p>`).join('')||'<p>No funded dependency fully held.</p>'}<h3>WHAT REMAINED EXPOSED</h3>${(v.exposures||[]).map(x=>`<p>△ ${e(x)}</p>`).join('')||'<p>No material exposure in this prototype model.</p>'}</details>`}
export function mountPhoneStory(root,ctx){
 const key=positionKey(ctx),slides=buildPhoneStory(ctx.team,ctx),old=mounted.get(root),index=Math.max(0,Math.min(slides.length-1,old?.key===key?old.index:loadPosition(key))),slide=slides[index];
 const previousVideo=old?.key===key&&old.slideId===slide.id?root.querySelector('.phone-story video'):null;
 const state={key,index,slideId:slide.id};mounted.set(root,state);
 root.innerHTML=`<main class="phone phone-story" data-story-step="${e(slide.id)}"><div class="story-meta"><span>${e(ctx.team.table_name)} · YOUR STORY</span><span aria-live="polite">${index+1} / ${slides.length}</span></div><small class="story-eyebrow">${e(slide.eyebrow)}</small><h1 data-story-title tabindex="-1">${e(slide.title)}</h1>${slide.strengthened?'<p class="story-strengthened">STRENGTHENED · SAME DESIGN, DEEPER SUPPORT</p>':''}${slide.image?`<figure class="story-media"><img src="${asset(slide.image)}" alt="Arthur illustration for ${e(slide.title)}"></figure>`:''}${slide.film?`<figure class="story-media story-film"><video controls playsinline preload="metadata" ${slide.poster?`poster="${asset(slide.poster)}"`:''} src="${e(slide.film.src)}"></video><p class="film-error" role="status" hidden>Your table’s film is not available yet. Your complete design story remains available.</p></figure>`:''}<p class="story-body">${e(slide.body)}</p>${slide.limit?`<p class="story-limit"><b>STILL DEPENDS ON</b><br>${e(slide.limit)}</p>`:''}${slide.architecture?`<details><summary>YOUR ARCHITECTURAL RESPONSE</summary><p>${e(slide.architecture)}</p></details>`:''}${slide.prediction?`<p><b>YOUR TABLE’S PREDICTION</b><br>${e(slide.prediction)}</p>${slide.myPrediction?`<p>YOUR PREDICTION · ${e(slide.myPrediction)}</p>`:''}`:''}${slide.cost?`<div class="story-resources"><p>RESPONSE COST<br><b>◆ ${e(slide.cost.capital)} · ● ${e(slide.cost.change)}</b></p><p>REMAINING<br><b>◆ ${e(slide.remaining.capital)} · ● ${e(slide.remaining.change)}</b></p></div>${slide.automatic?'<p class="story-note">This response was selected through the facilitator’s default or a disclosed tie-break.</p>':''}`:''}${slide.evaluation?detailsHTML(slide.evaluation):''}${slide.labels?`<div class="story-lens">${slide.labels.map(l=>`<span>${e(l)}</span>`).join('')}</div>`:''}<nav class="story-controls" aria-label="Your reveal story"><button id="story-back" ${index===0?'disabled':''}>BACK</button><button id="story-next">${index===slides.length-1?'REPLAY STORY':'NEXT'}</button></nav>${slide.closing?'<button id="story-reflect" class="secondary">ADD MY TAKEAWAY</button>':''}<small class="story-local-note">These story controls affect only this phone.</small></main>`;
 if(previousVideo){const next=root.querySelector('video');if(next)next.replaceWith(previousVideo)}
 const video=root.querySelector('video');if(video){video.playsInline=true;video.onerror=()=>{video.pause?.();video.hidden=true;const msg=root.querySelector('.film-error');if(msg)msg.hidden=false}}
 const go=next=>{savePosition(key,next);state.index=next;mountPhoneStory(root,ctx);root.querySelector('[data-story-title]')?.focus({preventScroll:true});};
 root.querySelector('#story-back').onclick=()=>{if(index>0)go(index-1)};root.querySelector('#story-next').onclick=()=>go(index===slides.length-1?0:index+1);
 const reflection=root.querySelector('#story-reflect');if(reflection)reflection.onclick=()=>ctx.onReflect?.();
}
