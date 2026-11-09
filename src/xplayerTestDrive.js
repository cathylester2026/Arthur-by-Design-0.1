import './xplayerTestDrive.css';
import {createRoom,join,load,all,vote,advanceRoom,phase,sub} from './parityEngine.js';
import {PERSPECTIVES,escapeHTML as e} from './perspectivePrompts.js';
import {ballot} from './leaveWellXplayerFlow.js';
import {mutatePreview,resetPreview} from './previewStore.js';
import {isPreview} from './xplayerBackend.js';
export async function start(root){
 if(!isPreview)throw Error('Test Drive requires isolated preview mode.');
 root.innerHTML=`<main class="test-drive"><header><small>ARTHUR: BY DESIGN · PRIVATE REHEARSAL</small><h1>XPLAYER TEST DRIVE</h1><p>Eight tables. Five independent voters each. The host and phone panels below run the same game files included in this delivery.</p><p>This rehearsal stays in this browser. It cannot change your live game, and its QR links do not connect other devices.</p><button id="new-rehearsal">START A NEW EIGHT-TABLE ROOM</button><label><input id="test-tie" type="checkbox" checked> Include a 2–2 tie on the first investment</label><label><input id="small-rehearsal" type="checkbox"> Smaller rehearsal: four tables, four players</label><p id="test-error" role="alert"></p></header><div id="rehearsal"></div></main>`;
 document.querySelector('#new-rehearsal').onclick=async()=>{try{await create()}catch(err){document.querySelector('#test-error').textContent=err.message}};
 async function create(){
  document.querySelector('#new-rehearsal').disabled=true;resetPreview();
  const small=document.querySelector('#small-rehearsal').checked,tables=small?4:8,seats=small?4:5;const s=await createRoom(),players=[];const roles=Object.keys(PERSPECTIVES);
  for(let i=0;i<tables*seats;i++){const x=await join({session:s,table:'Table '+(Math.floor(i/seats)+1),alias:'TEST PLAYER '+(i+1),role:roles[i%roles.length],consent:false});players.push(x.player);localStorage.setItem(`abd-xplayer-player:${s.code}:seat:${i+1}`,x.player.id)}
  const u=(mode,seat)=>{const url=new URL(location.href);url.search='';url.searchParams.set('mode',mode);url.searchParams.set('preview','1');url.searchParams.set('room',s.code);if(seat)url.searchParams.set('seat',seat);return url.href};
  document.querySelector('#rehearsal').innerHTML=`<section class="test-controls"><div id="test-status" aria-live="polite"></div><fieldset><legend>REHEARSAL ONLY · simulated absences</legend><label>Table <select id="chaos-table">${Array.from({length:tables},(_,i)=>`<option value="${i+1}">Table ${i+1}</option>`).join('')}</select></label><button id="chaos-one">ONE VOTER SILENT</button><button id="chaos-table-silent">WHOLE TABLE SILENT</button><button id="chaos-all">EVERYONE SILENT</button><button id="chaos-reset">RESTORE SIMULATED VOTERS</button><p id="chaos-status">All scripted voters enabled. These controls only affect the rehearsal helper.</p></fieldset><button id="fill-votes">CAST REMAINING PLAYERS’ VOTES</button><button id="test-next">FACILITATOR NEXT</button><button id="test-independent">OPEN INDEPENDENT PLAYER</button><div id="independent-preview"></div><p>Choose on any phone yourself, then fill the remaining votes. Use Facilitator Next to advance. Runoffs need another vote. The opening question is optional.</p><label>VIEW PLAYER <select id="test-seat">${players.map((p,i)=>`<option value="${i+1}">Table ${Math.floor(i/seats)+1} · Player ${i+1} · ${e(p.role_type)}</option>`).join('')}</select></label><a id="open-phone" href="${e(u('join',1))}" target="_blank" rel="noopener">OPEN THIS PHONE IN A TAB</a></section><section class="test-panels"><div><h2>FACILITATOR</h2><iframe title="Actual facilitator screen" src="${e(u('host'))}" id="test-host"></iframe></div><div><h2>PLAYER PHONE</h2>${players.map((p,i)=>`<iframe title="Table ${Math.floor(i/seats)+1} player ${i+1}" src="${e(u('join',i+1))}" id="test-phone-${i+1}" ${i?'hidden':''}></iframe>`).join('')}</div></section>`;
  if(globalThis.__arthurFrameDocument){
   const host=document.querySelector('#test-host');host.removeAttribute('src');host.srcdoc=globalThis.__arthurFrameDocument(u('host'));
   players.forEach((p,i)=>{const frame=document.querySelector('#test-phone-'+(i+1));frame.removeAttribute('src');frame.srcdoc=globalThis.__arthurFrameDocument(u('join',i+1))});
   document.querySelector('#open-phone').hidden=true;
  }
  document.querySelector('#test-seat').onchange=ev=>{document.querySelectorAll('[id^="test-phone-"]').forEach(f=>f.hidden=f.id!=='test-phone-'+ev.target.value);document.querySelector('#open-phone').href=u('join',ev.target.value)};
  const silent=new Set();
  function silence(which){const table=Number(document.querySelector('#chaos-table').value),ids=players.filter((p,i)=>Math.floor(i/seats)+1===table);if(which==='one')silent.add(ids[0].id);if(which==='table')ids.forEach(p=>silent.add(p.id));if(which==='all')players.forEach(p=>silent.add(p.id));if(which==='reset')silent.clear();document.querySelector('#chaos-status').textContent=silent.size+' scripted voter(s) will abstain. Existing cast votes are retained. Use Resolve Votes to continue.'}
  document.querySelector('#chaos-one').onclick=()=>silence('one');document.querySelector('#chaos-table-silent').onclick=()=>silence('table');document.querySelector('#chaos-all').onclick=()=>silence('all');document.querySelector('#chaos-reset').onclick=()=>silence('reset');
  let independentSeat=0;
  document.querySelector('#test-independent').onclick=()=>{const frame=document.createElement('iframe');frame.id='independent-test-phone';frame.title='Independent player · no room votes';frame.style='width:390px;height:760px';if(globalThis.__arthurFrameDocument)frame.srcdoc=globalThis.__arthurFrameDocument(u('studio-solo','independent-'+(++independentSeat)));else frame.src=u('studio-solo','independent-'+(++independentSeat));document.querySelector('#independent-preview').replaceChildren(frame)};
  const update=async()=>{const fresh=await load(s.code),d=await all(fresh);document.querySelector('#test-status').textContent=`ROOM ${s.code} · ${fresh.phase.toUpperCase()} · ${d.players.length} PLAYERS · `+d.teams.map(t=>`${t.table_name}: ◆${t.capital} / ●${t.change_budget}`).join(' | ')};
  await sub(s,update);await update();
  const guarded=fn=>async ev=>{ev.target.disabled=true;try{document.querySelector('#test-error').textContent='';await fn()}catch(err){document.querySelector('#test-error').textContent=err.message}finally{ev.target.disabled=false}};
  document.querySelector('#test-next').onclick=guarded(async()=>{const fresh=await load(s.code),d=await all(fresh);if(fresh.phase==='designReveal'&&d.teams.some(t=>t.investments.length>=2))await phase(fresh,'event');else await advanceRoom(fresh,{force:true});await update()});
  document.querySelector('#fill-votes').onclick=guarded(async()=>{
   const fresh=await load(s.code),d=await all(fresh);
   for(let i=0;i<players.length;i++){
    const p=players[i];if(silent.has(p.id))continue;const t=d.teams.find(t=>t.id===p.team_id),b=ballot(t,fresh.phase);
    if(fresh.phase==='opening'){if(!d.votes.some(v=>v.player_id===p.id&&v.decision==='opening_challenge'))await vote({session:fresh,team:t,player:p,key:'opening_challenge',choice:i%2?'One clear plan at home':'Someone who owns the changed handoff'});continue}
    if(!b||d.votes.some(v=>v.player_id===p.id&&v.decision===b.key))continue;
    let choice;const group=Math.floor(i/seats)%4,pos=i%seats;
    if(fresh.phase==='invest')choice=t.investments.length?(group===1?'meds':'wayfinding'):group===0?(document.querySelector('#test-tie').checked?(pos<2?'meds':pos<4?'ambient':'wayfinding'):'meds'):group===1?'ambient':group===2?'command':'ambient';
    if(fresh.phase==='design')choice={meds:'pharmacy',ambient:'shared',wayfinding:'layered',command:'center'}[t.locked_capability];
    if(fresh.phase==='adapt')choice=group===0||group===2?'strengthen':'extend';
    if(fresh.phase==='event')choice=group===0?'NOT SURE':'YES';
    if(fresh.phase==='respond')choice=group===0||group===2?'use':'escalate';
    if(b.runoff)choice=b.options[pos<Math.ceil(seats/2)?0:1]||b.options[0];
    if(!b.options.includes(choice))choice=b.options[0];
    await vote({session:fresh,team:t,player:p,key:b.key,choice});
   }
   await update();
  });
 }
}
