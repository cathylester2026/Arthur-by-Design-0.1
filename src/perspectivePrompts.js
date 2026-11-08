export const PERSPECTIVES={
 'Architecture / Interior Design':['Where can Arthur actually do this?','Consider privacy, accessibility, waiting and space for someone to help.'],
 Engineering:['If the supporting system fails, what can Arthur still rely on?','Identify the physical or technical fallback.'],
 'Clinical Care':['Who confirms this is safe and understood—and acts when Arthur’s needs change?','Identify the responsible person.'],
 'Healthcare Operations':['Can we deliver this on a busy evening with fewer staff?','Identify the capacity and ownership required.'],
 'Digital / Technology / AI':['What turns this information into a reliable action for Arthur?','Identify the data, recipient and fallback.'],
 'Patient Experience':['What work are we asking Arthur or his caregiver to do?','Consider life without a smartphone or available family member.'],
 'Strategy / Leadership':['What improvement would justify this investment?','Name an outcome and who would be accountable for it.'],
 'Research / Education':['What are we assuming, and how would we know this helped Arthur?','Identify one assumption to test.'],
 Other:['What dependency would your experience help this table notice?','Name something Arthur needs that the proposal overlooks.']
};
export const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function perspectiveHTML(player,phase,votes,team){
 if(!['invest','design','adapt','impact','respond','result','principles'].includes(phase))return '';
 const e=escapeHTML,[question,hint]=PERSPECTIVES[player.role_type]||PERSPECTIVES.Other;
 const key='reflection:condition',mine=votes.find(v=>v.player_id===player.id&&v.decision===key)?.choice||'';
 const review=['impact','respond','result','principles'].includes(phase);
 return `<aside class="perspective-prompt"><small>YOUR PERSPECTIVE · ${e(player.role_type||'Other')}</small><h2>${review?'DOES YOUR CONDITION STILL HOLD?':e(question)}</h2><p>${review?'What would need to change for Arthur?':e(hint)}</p>${review&&mine?`<blockquote>${e(mine)}</blockquote>`:''}<details><summary>${review?'Add a takeaway':'For this choice to work…'}</summary><label>${review?'One question our team should investigate':'For this choice to work, this must be true'}<textarea id="perspective-thought" data-reflection-key="${review?'takeaway':'condition'}" maxlength="500">${e(review?votes.find(v=>v.player_id===player.id&&v.decision==='reflection:takeaway')?.choice||'':mine)}</textarea></label><button id="save-perspective" data-key="${review?'reflection:takeaway':key}">SAVE MY REFLECTION</button><small>Optional · shared with your facilitator · does not affect scoring</small></details></aside>`;
}
