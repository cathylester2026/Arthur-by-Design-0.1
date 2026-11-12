import {optionArtwork} from './leaveWellArtwork.js';
import {contributionsHTML,heldAndRemainingHTML} from './revealLearning.js';
import {portfolioStackHTML} from './portfolioRevealViews.js';
import {decisionSourceLabel} from './studioPolicy.js';
import {strengthenCopy} from './causalEngine.js';
import {combinedImpact,strengthenImpact} from './portfolioImpact.js';
import {demandSummaryHTML} from './xplayerFlowViews.js';
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
export function buildPhoneStory(team,{player,votes=[],mode='facilitated'}={}){
 const inv=team.investments||[],evaluation=team.game_state?.evaluation||evaluate(team),response=team.game_state?.responseId||'use',cost=team.game_state?.resourceCost||{capital:0,change:0};
 const mine=votes.find(v=>v.player_id===player?.id&&v.team_id===team.id&&v.decision==='prediction');
 const slides=[{id:'arthur',eyebrow:'YOUR LEAVE WELL STORY',title:'SAME ARTHUR. YOUR TABLE’S DESIGN.',image:'arthur-leave-well.png',body:'Arthur is preparing to leave hospital after cardiac surgery. Your table chose what would help him understand the plan, move safely, stay connected and know who can respond.'}];
 inv.forEach((i,index)=>{const c=CAPABILITIES[i.capabilityId],o=c?.options?.[i.commitmentId],id=IDS[i.capabilityId]?.[i.commitmentId];if(!c||!o||!id)return;const b=ARCHITECTURAL_BASELINE[id.slice(-2)];slides.push({id:'investment-'+index,eyebrow:'INVESTMENT '+(index+1)+' · '+c.title,title:o[0],image:optionArtwork(i.capabilityId,i.commitmentId,{reveal:true})||o[1],strengthened:i.strengthened===true,panel:i.strengthened?strengthenImpact(i,CAPABILITIES):null,body:o[2],limit:b?.['PRIMARY VULNERABILITY']||o[3],architecture:b?.['SPACE + CONFIGURATION / ENVIRONMENT']||o[3]})});
 if(inv.length>1){const f=resolveArchitecturalFeatures({activations:inv});slides.push({id:'portfolio',panel:combinedImpact(inv,CAPABILITIES),eyebrow:'YOUR COMBINED DESIGN',title:'ONE CONNECTED JOURNEY.',body:f.enabled.includes('shared_adaptable_transition_setting')?'Your choices can share one adaptable consultation setting for discharge understanding and medication review. The space can be shared; clinical ownership, staffing and scheduling still need to be arranged.':'Your two capabilities support different parts of Arthur’s journey. They add to one another without automatically resolving each other’s staffing, authority or operating dependencies.',labels:inv.map(i=>CAPABILITIES[i.capabilityId]?.title).filter(Boolean)})}
 slides.push({id:'disruption',eyebrow:'THE DISRUPTION',title:'THREE THINGS CHANGED.',body:'Transport arrived 20 minutes early. Arthur’s family contact was unavailable. The receiving team still had the original plan.',prediction:predictionText(team.game_state?.prediction),myPrediction:mine?.choice});
 slides.push({id:'response',eyebrow:'YOUR TABLE’S RESPONSE',title:RESPONSES[response]?.[0]||'RESPONSE NOT RECORDED',body:RESPONSES[response]?.[1]||'Review your funded design and remaining dependencies.',cost,remaining:{capital:team.capital,change:team.change_budget},automatic:/random|default|fallback|automatic/.test(team.game_state?.last_decision?.source||'')});
 slides.push({id:'outcome',eyebrow:'PERFORMANCE UNDER PRESSURE',title:evaluation.outcome,prediction:predictionText(team.game_state?.prediction),comparison:team.game_state?.baseline||evaluate(team),body:'This is how the prototype evaluated your design against the same disruption.',evaluation});
 const film=configuredFilm(team);
 const decisions=inv.map((i,index)=>{const c=CAPABILITIES[i.capabilityId],id=IDS[i.capabilityId]?.[i.commitmentId];return {number:index+1,capability:c?.title||i.capabilityId,letter:id?.slice(-1)||'?',code:id||'UNKNOWN',design:c?.options?.[i.commitmentId]?.[0]||i.commitmentId,strengthened:!!i.strengthened}});
 const strategy=team.game_state?.applied_decisions?.strategy?.choice;
 slides.push({id:'film',eyebrow:'YOUR DESIGNED FUTURE',title:film?'YOUR TABLE’S ARCHITECTURAL FILM.':'YOUR TABLE’S FINAL REVEAL.',film,placeholder:!film,reveal:{table:team.table_name,key:phoneVideoKey(inv)||'NO MATCHING DESIGN',decisions,strategy:strategy?strategy.toUpperCase():inv.length>1?'EXTEND':inv.some(i=>i.strengthened)?'STRENGTHEN':'NOT RECORDED',prediction:predictionText(team.game_state?.prediction),response:RESPONSES[response]?.[0]||'NOT RECORDED',outcome:evaluation.outcome,records:Object.values(team.game_state?.applied_decisions||{}).map(r=>({...r,label:decisionRecordLabel(r,team)})),demands:evaluation},poster:inv[0]&&(optionArtwork(inv[0].capabilityId,inv[0].commitmentId,{reveal:true})||CAPABILITIES[inv[0].capabilityId]?.options?.[inv[0].commitmentId]?.[1]),body:film?'This pre-rendered film shows your selected architectural design. Your response and outcome are recorded below.':'This is where your table’s prerecorded architectural video will play. For now, this placeholder shows the selections that lead to it.'});
 slides.push({id:'reflection',eyebrow:'USEFUL · RESILIENT · HUMAN',title:'WHAT CAN ARTHUR NOW RELY ON?',body:'Useful: which task can Arthur now complete? Resilient: what still works when support changes? Human: what can Arthur understand, trust and ask for help with? Use the three demand results to identify one strength and one remaining dependency.',labels:['UNDERSTAND','MOVE','CONNECT','TRUST'],closing:true});
 if(mode==='solo')for(const slide of slides)for(const k of ['title','body','eyebrow'])if(typeof slide[k]==='string')slide[k]=slide[k].replace(/YOUR TABLE’S/g,'YOUR').replace(/Your table’s/g,'Your').replace(/your table’s/g,'your').replace(/your table chose/gi,'you chose');
 return slides;
}
function fingerprint(team){return JSON.stringify({investments:(team.investments||[]).map(i=>[i.capabilityId,i.commitmentId,!!i.strengthened]),response:team.game_state?.responseId,evaluation:team.game_state?.evaluation})}
function positionKey(ctx){return 'abd-phone-story:'+ctx.session.id+':'+ctx.player.id+':'+ctx.team.id+':'+fingerprint(ctx.team)}
function loadPosition(key){let value;try{value=Number(sessionStorage.getItem(key)||0)}catch{value=positions.get(key)||0}return Number.isInteger(value)&&value>=0?value:0}
function savePosition(key,index){positions.set(key,index);try{sessionStorage.setItem(key,String(index))}catch{}}
function detailsHTML(v,before,investments=[]){return `<details class="portfolio-explanation"><summary>See why · movement, plan & ownership</summary>${contributionsHTML(v,investments)}${demandSummaryHTML(v,before)}${heldAndRemainingHTML(v)}</details>`}
function decisionRecordLabel(r,team){const round=Number(r.key?.match(/\d+/)?.[0]||1);if(r.key?.startsWith('capability'))return 'Investment '+round+' · '+(CAPABILITIES[r.choice]?.title||r.choice);if(r.key?.startsWith('design')){const cap=team?.investments?.[round-1]?.capabilityId;return 'Design '+round+' · '+(CAPABILITIES[cap]?.options?.[r.choice]?.[0]||r.choice)}if(r.key==='strategy')return 'Design strategy · '+String(r.choice).toUpperCase();return 'Response · '+(RESPONSES[r.choice]?.[0]||r.choice)}
function revealBoardHTML(r,placeholder){return `<section class="film-reveal-board" aria-label="Your final design reveal"><small>${placeholder?'VIDEO PLACEHOLDER · YOUR SELECTED DESIGN':'YOUR SELECTED DESIGN'}</small><h2>${e(r.table)}</h2>${r.decisions.map(d=>`<article><small>INVESTMENT ${d.number} · ${e(d.code)}</small><h3>${e(d.capability)}</h3><p><b>DESIGN ${e(d.letter)}</b> · ${e(d.design)}${d.strengthened?'<br><strong>STRENGTHENED</strong>':''}</p></article>`).join('')||'<p>No investment was recorded.</p>'}<dl><dt>STRENGTHEN / EXTEND</dt><dd>${e(r.strategy)}</dd><dt>TABLE PREDICTION · OPINION ONLY</dt><dd>${e(r.prediction)}</dd><dt>RESPONSE</dt><dd>${e(r.response)}</dd><dt>OUTCOME</dt><dd>${e(r.outcome)}</dd></dl>${r.records?.length?`<details class="studio-choice-record"><summary>HOW YOUR DECISIONS WERE RESOLVED</summary><ul>${r.records.map(x=>`<li>${e(x.label||x.choice)}<br>${e(decisionSourceLabel(x.source))}${x.cast!==undefined?` · ${e(x.cast)} received / ${e(x.eligible)} eligible`:''}</li>`).join('')}</ul></details>`:''}${r.demands?demandSummaryHTML(r.demands):''}<p class="film-selection-key">DESIGN FILM KEY<br><b>${e(r.key)}</b></p></section>`}
export function mountPhoneStory(root,ctx){
 const key=positionKey(ctx),slides=buildPhoneStory(ctx.team,ctx),old=mounted.get(root),index=Math.max(0,Math.min(slides.length-1,old?.key===key?old.index:loadPosition(key))),slide=slides[index];
 const previousVideo=old?.key===key&&old.slideId===slide.id?root.querySelector('.phone-story video'):null;
 const finish=ctx.onComplete||ctx.onClose;
 const state={key,index,slideId:slide.id};mounted.set(root,state);
 root.innerHTML=`<main class="phone phone-story" data-story-step="${e(slide.id)}"><div class="story-meta"><span>${e(ctx.team.table_name)} · YOUR STORY</span><span aria-live="polite">${index+1} / ${slides.length}</span></div><small class="story-eyebrow">${e(slide.eyebrow)}</small><h1 data-story-title tabindex="-1">${e(slide.title)}</h1>${slide.strengthened?'<p class="story-strengthened">STRENGTHENED · SAME DESIGN, DEEPER SUPPORT</p>':''}${slide.image?`<figure class="story-media"><img src="${asset(slide.image)}" alt="Arthur illustration for ${e(slide.title)}"></figure>`:''}${slide.film?`<figure class="story-media story-film"><video controls playsinline preload="metadata" ${slide.poster?`poster="${asset(slide.poster)}"`:''} src="${e(slide.film.src)}"></video><p class="film-error" role="status" hidden>Your table’s film is not available yet. Your complete design story remains available.</p></figure>`:''}<p class="story-body">${e(slide.body)}</p>${['disruption','response','outcome'].includes(slide.id)?portfolioStackHTML(ctx.team):''}${slide.panel||''}${slide.comparison?`<section class="prediction-comparison"><b>${ctx.mode==='solo'?'YOU PREDICTED':'YOUR TABLE PREDICTED'}</b><p>${e(slide.prediction)}</p><b>BEFORE YOUR RESPONSE</b><p>${e(slide.comparison.outcome)}</p><b>AFTER YOUR RESPONSE</b><p>${e(slide.evaluation.outcome)}</p><small>Prediction is opinion only. The response may change performance.</small></section>`:''}${slide.reveal?revealBoardHTML(slide.reveal,slide.placeholder):''}${slide.limit?`<p class="story-limit"><b>STILL DEPENDS ON</b><br>${e(slide.limit)}</p>`:''}${slide.architecture?`<details><summary>YOUR ARCHITECTURAL RESPONSE</summary><p>${e(slide.architecture)}</p></details>`:''}${slide.prediction&&!slide.comparison?`<p><b>${ctx.mode==='solo'?'YOUR PREDICTION':'YOUR TABLE’S PREDICTION'}</b><br>${e(slide.prediction)}</p>${slide.myPrediction?`<p>YOUR PREDICTION · ${e(slide.myPrediction)}</p>`:''}`:''}${slide.cost?`<div class="story-resources"><p>RESPONSE COST<br><b>◆ ${e(slide.cost.capital)} · ● ${e(slide.cost.change)}</b></p><p>REMAINING<br><b>◆ ${e(slide.remaining.capital)} · ● ${e(slide.remaining.change)}</b></p></div>${slide.automatic?'<p class="story-note">This response was selected through the facilitator’s default or a disclosed tie-break.</p>':''}`:''}${slide.evaluation?detailsHTML(slide.evaluation,slide.comparison,ctx.team.investments||[]):''}${slide.labels?`<div class="story-lens">${slide.labels.map(l=>`<span>${e(l)}</span>`).join('')}</div>`:''}<nav class="story-controls" aria-label="Your reveal story"><button id="story-back" ${index===0?'disabled':''}>BACK</button><button id="story-next">${index===slides.length-1?(finish?(ctx.readOnly?'RETURN TO JOURNEY':'FINISH · JOURNEY'):'REPLAY STORY'):'NEXT'}</button></nav>${slide.closing&&ctx.onReflect?'<button id="story-reflect" class="secondary">ADD MY TAKEAWAY</button>':''}${ctx.onClose&&index!==slides.length-1?'<button id="story-close" class="secondary">RETURN TO JOURNEY</button>':''}${index===slides.length-1&&finish?'<button id="story-replay" class="secondary">REPLAY STORY</button>':''}<small class="story-local-note">${ctx.readOnly?'Review only. Your decisions and result remain saved.':'These story controls affect only this phone.'}</small></main>`;
 if(previousVideo){const next=root.querySelector('video');if(next)next.replaceWith(previousVideo)}
 const video=root.querySelector('video');if(video){video.playsInline=true;video.onerror=()=>{video.pause?.();video.hidden=true;const msg=root.querySelector('.film-error');if(msg)msg.hidden=false}}
 const go=next=>{savePosition(key,next);state.index=next;mountPhoneStory(root,ctx);root.querySelector('[data-story-title]')?.focus({preventScroll:true});root.ownerDocument?.defaultView?.scrollTo?.(0,0);};
 root.querySelector('#story-back').onclick=()=>{if(index>0)go(index-1)};root.querySelector('#story-next').onclick=()=>{if(index===slides.length-1&&finish)finish();else go(index===slides.length-1?0:index+1)};
 const replay=root.querySelector('#story-replay');if(replay)replay.onclick=()=>go(0);
 const close=root.querySelector('#story-close');if(close)close.onclick=()=>ctx.onClose?.();
 const reflection=root.querySelector('#story-reflect');if(reflection)reflection.onclick=()=>ctx.onReflect?.();
}
