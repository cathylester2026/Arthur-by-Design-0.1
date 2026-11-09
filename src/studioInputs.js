// Keep each participant's input, including identical wording from different people.
export function openingInputs(votes=[]){return votes.map((v,i)=>({v,i})).filter(({v})=>v.decision==='opening_challenge'&&typeof v.choice==='string'&&v.choice.trim()&&v.choice!=='[SKIPPED]').sort((a,b)=>{const x=Date.parse(a.v.created_at||''),y=Date.parse(b.v.created_at||'');return Number.isFinite(x)&&Number.isFinite(y)?x-y||a.i-b.i:a.i-b.i}).map(({v})=>v)}

// Display-only prompts. Never submitted as votes or exported as participant input.
export const OPENING_STARTERS=Object.freeze([
 'A clear plan Arthur can understand and use at home.',
 'A safe way home, even when family cannot be there.',
 'Someone accountable when the plan changes.'
]);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function openingWallHTML(votes=[],{playerId=null,phone=false,allowExamples=true}={}){
 const inputs=openingInputs(votes),mine=playerId&&inputs.find(v=>v.player_id===playerId),visible=inputs.slice(0,25),examples=!inputs.length&&allowExamples,waiting=!inputs.length&&!allowExamples;
 const tiles=examples?OPENING_STARTERS.map(text=>({text,example:true})):visible.filter(v=>!phone||v.player_id!==playerId).map(v=>({text:v.choice,example:false}));
 return `<section class="studio-inputs" data-opening-count="${inputs.length}" data-opening-source="${examples?'examples':waiting?'waiting':'participants'}" aria-label="Opening question responses"><div class="studio-inputs-heading"><span>${examples?'Discussion starters':waiting?'Waiting for the room':'Voices from the room'}</span><b>${inputs.length} participant response${inputs.length===1?'':'s'} captured</b></div>${waiting?'<p class="studio-example-note">Take a moment to share your first instinct. Responses will appear here as they arrive.</p>':''}${examples?'<p class="studio-example-note">No participant responses yet. These examples can start the discussion; they are not saved as responses.</p>':''}${phone&&mine?`<blockquote class="studio-own-response" data-personal-response><small>Your response · saved</small><p>“${esc(mine.choice)}”</p></blockquote>`:''}${tiles.length?`<div class="studio-input-grid">${tiles.map(v=>`<blockquote class="studio-input-card${v.example?' is-example':''}" data-response-example="${v.example}"><small>${v.example?'Example · discussion starter':'Participant response'}</small><p>${v.example?'':'“'}${esc(v.text)}${v.example?'':'”'}</p></blockquote>`).join('')}</div>`:''}${inputs.length>25?`<p class="studio-input-count">Showing the first 25 room responses.${phone?' Your own response is always shown above.':''} All ${inputs.length} submitted responses remain captured.</p>${phone?'':`<details class="all-studio-inputs" data-view-key="all-opening-responses"><summary>Read all ${inputs.length} responses</summary><ol>${inputs.map(v=>`<li>${esc(v.choice)}</li>`).join('')}</ol></details>`}`:''}</section>`;
}
