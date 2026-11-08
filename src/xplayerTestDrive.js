import './xplayerTestDrive.css';
import {createRoom,join,load,all,vote,advanceRoom,phase,sub} from './parityEngine.js';
import {PERSPECTIVES,escapeHTML as e} from './perspectivePrompts.js';
import {ballot} from './leaveWellXplayerFlow.js';
import {resetPreview} from './previewStore.js';
import {isPreview} from './xplayerBackend.js';
export async function start(root){
 if(!isPreview)throw Error('Test Drive requires isolated preview mode.');
 root.innerHTML=`<main class="test-drive"><header><small>ARTHUR: BY DESIGN · PRIVATE REHEARSAL</small><h1>XPLAYER TEST DRIVE</h1><p>Two tables. Four independent players each. The host and phone panels below run the same game files included in this delivery.</p><p>This rehearsal stays in this browser. It cannot change your live game, and its QR links do not connect other devices.</p><button id="new-rehearsal">START A NEW TWO-TABLE ROOM</button><label><input id="test-tie" type="checkbox" checked> Include a 2–2 tie on the first investment</label><p id="test-error" role="alert"></p></header><div id="rehearsal"></div></main>`;
 document.querySelector('#new-rehearsal').onclick=async()=>{try{await create()}catch(err){document.querySelector('#test-error').textContent=err.message}};
 async function create(){
  document.querySelector('#new-rehearsal').disabled=true;resetPreview();
  const s=await createRoom(),players=[];const roles=Object.keys(PERSPECTIVES);
  for(let i=0;i<8;i++){const x=await join({session:s,table:i<4?'Table 1':'Table 2',alias:'TEST PLAYER '+(i+1),role:roles[i],consent:false});players.push(x.player);localStorage.setItem(`abd-xplayer-player:${s.code}:seat:${i+1}`,x.player.id)}
  const u=(mode,seat)=>{const url=new URL(location.href);url.search='';url.searchParams.set('mode',mode);url.searchParams.set('preview','1');url.searchParams.set('room',s.code);if(seat)url.searchParams.set('seat',seat);return url.href};
  document.querySelector('#rehearsal').innerHTML=`<section class="test-controls"><div id="test-status" aria-live="polite"></div><button id="fill-votes">CAST REMAINING PLAYERS’ VOTES</button><button id="test-next">FACILITATOR NEXT</button><p>Choose on any phone yourself, then fill the remaining votes. Use Facilitator Next to advance. Runoffs need another vote. The opening question is optional.</p><label>VIEW PLAYER <select id="test-seat">${players.map((p,i)=>`<option value="${i+1}">Table ${i<4?1:2} · Player ${i+1} · ${e(p.role_type)}</option>`).join('')}</select></label><a id="open-phone" href="${e(u('join',1))}" target="_blank" rel="noopener">OPEN THIS PHONE IN A TAB</a></section><section class="test-panels"><div><h2>FACILITATOR</h2><iframe title="Actual facilitator screen" src="${e(u('host'))}" id="test-host"></iframe></div><div><h2>PLAYER PHONE</h2>${players.map((p,i)=>`<iframe title="Table ${i<4?1:2} player ${i+1}" src="${e(u('join',i+1))}" id="test-phone-${i+1}" ${i?'hidden':''}></iframe>`).join('')}</div></section>`;
  if(globalThis.__arthurFrameDocument){
   const host=document.querySelector('#test-host');host.removeAttribute('src');host.srcdoc=globalThis.__arthurFrameDocument(u('host'));
   players.forEach((p,i)=>{const frame=document.querySelector('#test-phone-'+(i+1));frame.removeAttribute('src');frame.srcdoc=globalThis.__arthurFrameDocument(u('join',i+1))});
   document.querySelector('#open-phone').hidden=true;
  }
  document.querySelector('#test-seat').onchange=ev=>{document.querySelectorAll('[id^="test-phone-"]').forEach(f=>f.hidden=f.id!=='test-phone-'+ev.target.value);document.querySelector('#open-phone').href=u('join',ev.target.value)};
  const update=async()=>{const fresh=await load(s.code),d=await all(fresh);document.querySelector('#test-status').textContent=`ROOM ${s.code} · ${fresh.phase.toUpperCase()} · ${d.players.length} PLAYERS · `+d.teams.map(t=>`${t.table_name}: ◆${t.capital} / ●${t.change_budget}`).join(' | ')};
  await sub(s,update);await update();
  const guarded=fn=>async ev=>{ev.target.disabled=true;try{document.querySelector('#test-error').textContent='';await fn()}catch(err){document.querySelector('#test-error').textContent=err.message}finally{ev.target.disabled=false}};
  document.querySelector('#test-next').onclick=guarded(async()=>{const fresh=await load(s.code),d=await all(fresh);if(fresh.phase==='designReveal'&&d.teams.some(t=>t.investments.length>=2))await phase(fresh,'event');else await advanceRoom(fresh);await update()});
  document.querySelector('#fill-votes').onclick=guarded(async()=>{
   const fresh=await load(s.code),d=await all(fresh);
   for(let i=0;i<players.length;i++){
    const p=players[i],t=d.teams.find(t=>t.id===p.team_id),b=ballot(t,fresh.phase);
    if(fresh.phase==='opening'){if(!d.votes.some(v=>v.player_id===p.id&&v.decision==='opening_challenge'))await vote({session:fresh,team:t,player:p,key:'opening_challenge',choice:i%2?'One clear plan at home':'Someone who owns the changed handoff'});continue}
    if(!b||d.votes.some(v=>v.player_id===p.id&&v.decision===b.key))continue;
    let choice;
    if(fresh.phase==='invest')choice=t.investments.length?'wayfinding':i<4?(document.querySelector('#test-tie').checked&&i>=2?'ambient':'meds'):'ambient';
    if(fresh.phase==='design')choice={meds:'pharmacy',ambient:'shared',wayfinding:'layered',command:'center'}[t.locked_capability];
    if(fresh.phase==='adapt')choice=i<4?'strengthen':'extend';
    if(fresh.phase==='event')choice=i<4?'NOT SURE':'YES';
    if(fresh.phase==='impact')choice='ready';
    if(fresh.phase==='respond')choice=i<4?'use':'escalate';
    if(b.runoff)choice=b.options[i%4===3?1:0]||b.options[0];
    if(!b.options.includes(choice))choice=b.options[0];
    await vote({session:fresh,team:t,player:p,key:b.key,choice});
   }
   await update();
  });
 }
}
