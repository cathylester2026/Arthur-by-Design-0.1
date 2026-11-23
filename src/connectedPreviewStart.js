import './journeyViews.css';
import {createRoom} from './parityEngine.js';
import {navigateJourney} from './journeyBridge.js';
import {asset} from './leaveWellExperience.js';

const card=(n,name,sub,image,ready=false)=>'<article class="journey-start-card '+(ready?'ready':'locked')+'"><img src="'+asset(image)+'" alt="Arthur · '+name+'"><div><small>0'+n+' · '+name.toUpperCase()+'</small><h2>'+name+'</h2><p>'+sub+'</p>'+(ready?'<span class="journey-card-status">Ready to begin</span>':'<span class="journey-card-status">Opens after the previous chapter</span>')+'</div></article>';
export function start(root){
 const params=new URLSearchParams((globalThis.__arthurLocation||location).search);
 if(params.get('preview')!=='1'){
  root.innerHTML='<main class="connected-error"><h1>Start the full journey from the main menu.</h1><p>Choose Play the Full Journey for a private, connected solo rehearsal.</p><a href="./">Main menu</a></main>';return;
 }
 root.innerHTML='<div class="connected-journey journey-start"><header><a href="./">ARTHUR: BY DESIGN</a><span>ONE ARTHUR · THREE CHAPTERS</span><a href="./">Main menu</a></header><main><small>FULL JOURNEY · INDEPENDENT PLAY</small><h1>Follow Arthur from hospital to everyday life.</h1><p class="journey-opening-copy">Your investments will shape what Arthur can build on. Each chapter ends at the journey map so you can see what has been established—and what remains unresolved—before moving forward.</p><div class="journey-chapters journey-start-chapters">'+
 card(1,'Leave Well','Can Arthur get home with an effective handoff?','arthur-leave-well.png',true)+
 card(2,'Recover Well','What works when Arthur is recovering at home?','arthur-recover-well.png')+
 card(3,'Live Well','Can Arthur return to the things that give life meaning?','arthur-live-well.png')+
 '</div><button class="journey-primary" id="begin-connected-preview">START LEAVE WELL →</button><p class="journey-preview-note">No facilitator or room code required. The full journey runs on this device using local rehearsal data; it does not create a live workshop record in Supabase. Keep the same browser for all three chapters.</p><p id="connected-preview-error" role="alert"></p></main></div>';
 root.querySelector('#begin-connected-preview').onclick=async()=>{
  const button=root.querySelector('#begin-connected-preview');button.disabled=true;button.textContent='STARTING YOUR JOURNEY…';
  try{
   const session=await createRoom();
   navigateJourney('?'+new URLSearchParams({mode:'studio-solo',room:session.code,preview:'1'}));
  }catch(err){
   root.querySelector('#connected-preview-error').textContent=err.message;button.disabled=false;button.textContent='START LEAVE WELL →';
  }
 };
}
