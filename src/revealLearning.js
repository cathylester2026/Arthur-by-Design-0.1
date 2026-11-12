// Presentation only. Funded design contributions are distinct from realized event performance.
import {CAPABILITIES} from './leaveWellExperience.js';
import {strengthenCopy} from './causalEngine.js';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const contribution={
 'ambient.bedside':'You invested in creating a take-home plan within Arthur’s existing care setting, giving the team a clearer starting point for review.',
 'ambient.shared':'You provided a shared review setting where Arthur, his supporters and the care team can discuss and question the same plan.',
 'ambient.dedicated':'You designed an accountable guide role and handoff touchpoints so Arthur does not have to carry the coordination work alone.',
 'wayfinding.digital':'You invested in personal route guidance that can update as the hospital path changes, while the physical building stays largely as it was.',
 'wayfinding.layered':'You designed landmarks, physical cues and responsive information to reinforce one another, helping Arthur read the route through the building.',
 'wayfinding.escort':'You provided for a person-led journey, supported by recognizable meeting points, places to pause and navigation handoffs.',
 'meds.nurse':'You made medication discrepancies more visible at the point of work, creating a clearer opportunity for qualified review before Arthur leaves.',
 'meds.pharmacy':'You provided a protected medication-review setting and a qualified review path, giving Arthur a place to compare and question the plan.',
 'meds.huddle':'You invested in access to one confirmed medication plan across participating settings, reducing the need to carry disconnected versions.',
 'command.unit':'You made transition problems visible at existing points of work, giving staff an earlier opportunity to recognize and respond to Arthur’s disruption.',
 'command.center':'You designed adaptable transition space and an authorized operating model for activating an appropriate alternative when capacity is available.',
 'command.liaison':'You provided for a coordinator with current information and bounded authority, giving Arthur an identifiable person who can seek an available next step.'
};
export function fundedContributions(v,investments=[]){
 const source=investments.length?investments:(v.details||[]).flatMap(d=>(d.effects||[]).map(x=>x.activation).filter(Boolean));
 const unique=new Map();
 for(const i of source){const key=i.capabilityId+'.'+i.commitmentId,c=CAPABILITIES[i.capabilityId],o=c?.options?.[i.commitmentId];if(!o||!contribution[key])continue;if(!unique.has(key))unique.set(key,{title:c.title+' · '+o[0],body:contribution[key],strengthened:!!i.strengthened,strengthen:i.strengthened?strengthenCopy(i):''});}
 return [...unique.values()];
}
export function contributionsHTML(v,investments=[]){const items=fundedContributions(v,investments);return `<section class="design-contributions"><h3>What your design made possible for Arthur</h3><p class="contribution-scope">These are the settings, capabilities and support you funded. The event results below show what was usable under this disruption.</p>${items.map(x=>`<article><h4>${e(x.title)}</h4><p>${e(x.body)}</p>${x.strengthened?`<p><b>Strengthen commitment:</b> ${e(x.strengthen)} A funded fallback still needs to be usable when required.</p>`:''}</article>`).join('')||'<p>No completed A/B/C design is recorded, so no specific design contribution can be credited yet.</p>'}</section>`;}
const need={route:'a usable departure route and the support Arthur needs to follow it',information:'a clinically confirmed current plan that Arthur and the receiving team can use',coordination:'an accountable handoff owner and a usable next step'};
const held={route:'Arthur’s movement and departure are supported under the stated route conditions.',information:'The current-plan demand is supported under the stated confirmation and review conditions.',coordination:'Handoff ownership is supported through the available response path under the stated conditions.'};
export function demandExplanation(d){
 const effects=(d.effects||[]).filter(x=>x.causal).slice().sort((a,b)=>(b.fit||0)-(a.fit||0));
 const causal=[...new Set(effects.filter(x=>(x.fit||0)>0).map(x=>x.causal))];
 const limits=[...new Set([...(d.readinessGaps||[]),...(d.effects||[]).flatMap(x=>x.realizedReasons||[])])].filter(Boolean);
 const resolved=d.outcome==='ABSORBED'||d.outcome==='HOLDS';
 const position=resolved?held[d.id]||'This demand is supported under its stated operating conditions.':d.outcome==='STRAINED'?`Arthur has some support for this demand, but ${need[d.id]||'the complete required path'} is not fully established.`:`Arthur still needs ${need[d.id]||'a usable response for this demand'}.`;
 return {position,contributions:causal.length?causal:effects.length?[effects[0].causal]:[],limits};
}
export function demandExplanationHTML(d){const x=demandExplanation(d);return `<p>${e(x.position)}</p>${x.contributions.map(t=>`<p class="demand-contribution">${e(t)}</p>`).join('')}${x.limits.map(t=>`<p class="demand-limit"><b>Still needs support:</b> ${e(t)}</p>`).join('')}`;}
export function heldAndRemainingHTML(v){
 // Never credit an unresolved whole demand under "What held", even if its numeric score improved.
 const realized=(v.details||[]).filter(d=>['ABSORBED','HOLDS'].includes(d.outcome)&&!(d.readinessGaps||[]).length);
 const heldCopy=realized.length?realized.map(d=>`<p>✓ <b>${e(d.label)}:</b> ${e(held[d.id]||'Supported under the stated conditions.')}</p>`).join(''):'<p>No whole demand is confirmed as holding under these conditions. That does not erase the design contributions described above.</p>';
 const unresolved=(v.details||[]).filter(d=>!['ABSORBED','HOLDS'].includes(d.outcome)||(d.readinessGaps||[]).length);
 const remaining=unresolved.map(d=>{const x=demandExplanation(d);return `<p><b>${e(d.label)}:</b> ${e(x.limits.join(' ')||x.position)}</p>`}).join('');
 return `<section class="realized-support"><h3>What held under this disruption</h3>${heldCopy}</section><section class="remaining-support"><h3>What still needs support</h3>${remaining||((v.exposures||[]).length?v.exposures.map(x=>`<p>${e(x)}</p>`).join(''):'<p>No additional unmet demand is identified in this result. The design’s ongoing staffing, capacity and information requirements still apply.</p>')}</section>`;
}
