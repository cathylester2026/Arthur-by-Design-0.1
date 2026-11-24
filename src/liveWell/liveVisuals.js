// Visual language is conceptual, not proof that a service, route or clinician exists.
// Every design has a distinct readable scene with a common Arthur illustration style.
const scenes={
 mobility:{image:'arthur-community.png',alt:'Arthur in the community',label:'FROM HOME TO COMMUNITY'},
 care:{image:'arthur-connected-care.png',alt:'Arthur considering connected support and care',label:'CARE BEYOND THE HOSPITAL'},
 wellness:{image:'arthur-live-well.png',alt:'Arthur returning to community life',label:'EVERYDAY INDEPENDENCE'},
 services:{image:'arthur-community.png',alt:'Arthur participating in a community environment',label:'PEOPLE AND PLACES'}
};
const designs={
 '1A':['ROUTE DATA','Verified route','Accessible directions','Arthur’s choice'],
 '1B':['PHYSICAL ROUTE','Crossing and rest','Usable detour','Arthur can travel'],
 '1C':['TRANSPORT','Accessible pickup','Accepted journey','Arthur arrives'],
 '2A':['CARE POD','Private care space','Qualified connection','Accepted next step'],
 '2B':['CARE NETWORK','Care request','Referral accepted','Qualified response'],
 '2C':['MOBILE CARE','Arthur’s location','Staff and equipment','Accepted visit'],
 '3A':['WALKING','Approved goal','Feedback and rest','Arthur chooses pace'],
 '3B':['CONTEXT','Checked care information','Qualified receiver','Less repeat work'],
 '3C':['PARTICIPATION','Accessible alternative','Accepted format','Arthur takes part'],
 '4A':['FLEXIBLE SUPPORT','Rest and seating','Staffed assistance','Arthur participates'],
 '4B':['COMMUNITY HUB','Accessible venue','Confirmed arrangements','Arthur joins in'],
 '4C':['COORDINATION','Someone owns it','Confirmed connections','Arthur has options']
};
const disruptions={
 S1:{title:'THE ROUTE CHANGES',image:'arthur-community.png',alt:'Arthur’s community destination',parts:['A route is closed','Find a usable alternative','Arthur chooses whether to travel']},
 S2:{title:'ARTHUR NEEDS ADVICE',image:'arthur-connected-care.png',alt:'Arthur and available care connections',parts:['Arthur feels unusual fatigue','A qualified assessment is needed','Participation remains Arthur’s choice']},
 S3:{title:'THE VENUE CHANGES',image:'arthur-community.png',alt:'A community gathering setting',parts:['The event moves','Confirm accessible participation','Arthur makes a new plan']}
};

const pictograms={
 '1A':'<path d="M42 120L95 70L157 97L211 43" fill="none" stroke="#2c7b72" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 14"/><path d="M211 43l-12 0m12 0v12" stroke="#2c7b72" stroke-width="6"/><circle cx="42" cy="120" r="13" fill="#f1bc63"/><circle cx="211" cy="43" r="15" fill="#2c7b72"/>',
 '1B':'<path d="M10 136h240M15 65h220" stroke="#b5c8bb" stroke-width="9"/><path d="M36 106h35m20 0h35m20 0h35m20 0h35" stroke="#2c7b72" stroke-width="14" stroke-linecap="round"/><path d="M49 58v65m160-65v65" stroke="#d89a4a" stroke-width="6"/>',
 '1C':'<rect x="31" y="60" width="175" height="68" rx="15" fill="#2c7b72"/><rect x="49" y="75" width="48" height="30" rx="5" fill="#dcebe4"/><rect x="110" y="75" width="49" height="30" rx="5" fill="#dcebe4"/><circle cx="72" cy="130" r="17" fill="#384d50"/><circle cx="171" cy="130" r="17" fill="#384d50"/><path d="M210 90h24l12 22h-35" fill="#d89a4a"/>',
 '2A':'<rect x="61" y="37" width="132" height="122" rx="15" fill="#d5e7dd" stroke="#2c7b72" stroke-width="6"/><path d="M107 54h43v25h-43z" fill="#2c7b72"/><path d="M128 47v40m-19-20h38" stroke="#f7f7ed" stroke-width="7"/><rect x="80" y="105" width="94" height="36" rx="5" fill="#f7f7ed"/>',
 '2B':'<circle cx="128" cy="90" r="29" fill="#2c7b72"/><circle cx="40" cy="42" r="17" fill="#f1bc63"/><circle cx="219" cy="46" r="17" fill="#f1bc63"/><circle cx="36" cy="144" r="17" fill="#f1bc63"/><circle cx="218" cy="148" r="17" fill="#f1bc63"/><path d="M111 75L53 48M147 74l57-23M112 105L53 140M146 107l59 35" stroke="#2c7b72" stroke-width="7"/>',
 '2C':'<rect x="30" y="69" width="169" height="63" rx="9" fill="#2c7b72"/><path d="M199 90h24l20 42h-44" fill="#d89a4a"/><path d="M94 79v43m-21-22h43" stroke="white" stroke-width="10"/><circle cx="68" cy="134" r="16" fill="#384d50"/><circle cx="210" cy="134" r="16" fill="#384d50"/>',
 '3A':'<path d="M70 133l32-32l30 12l33-38l25 18" stroke="#2c7b72" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M51 49h153" stroke="#bfd4c6" stroke-width="6" stroke-linecap="round"/><path d="M87 43v13m47-13v13m47-13v13" stroke="#d89a4a" stroke-width="5"/><circle cx="70" cy="132" r="10" fill="#f1bc63"/>',
 '3B':'<rect x="59" y="27" width="143" height="144" rx="12" fill="#dcebe4" stroke="#2c7b72" stroke-width="6"/><path d="M80 62h99M80 89h70M80 115h99M80 144h63" stroke="#2c7b72" stroke-width="9" stroke-linecap="round"/><circle cx="190" cy="141" r="23" fill="#e8b967"/><path d="M179 141l8 8l15-20" stroke="#fff" stroke-width="6" fill="none"/>',
 '3C':'<rect x="30" y="44" width="202" height="113" rx="13" fill="#dcebe4" stroke="#2c7b72" stroke-width="6"/><circle cx="104" cy="93" r="23" fill="#f1bc63"/><path d="M72 136q30-43 63 0M151 70h57m-57 26h42m-42 26h57" stroke="#2c7b72" stroke-width="7" fill="none" stroke-linecap="round"/>',
 '4A':'<path d="M46 141v-52h65v52m0-28h83v28M36 141h180" fill="none" stroke="#2c7b72" stroke-width="11" stroke-linejoin="round"/><circle cx="152" cy="62" r="23" fill="#e8b967"/><path d="M152 88v31" stroke="#2c7b72" stroke-width="10"/>',
 '4B':'<path d="M31 152V70l97-45l97 45v82" fill="#dcebe4" stroke="#2c7b72" stroke-width="8" stroke-linejoin="round"/><rect x="102" y="96" width="52" height="56" rx="4" fill="#f1bc63"/><path d="M65 86h24m77 0h24" stroke="#2c7b72" stroke-width="9"/>',
 '4C':'<circle cx="128" cy="93" r="32" fill="#2c7b72"/><circle cx="40" cy="93" r="20" fill="#f1bc63"/><circle cx="215" cy="43" r="20" fill="#f1bc63"/><circle cx="213" cy="143" r="20" fill="#f1bc63"/><path d="M60 93h35m55-16l44-24m-44 58l44 25" stroke="#2c7b72" stroke-width="8"/><path d="M113 90l10 10l21-22" fill="none" stroke="white" stroke-width="6"/>'
};
const diagram=id=>'<svg class="lw-design-diagram" viewBox="0 0 260 190" role="img" aria-label="Conceptual illustration of '+esc(designs[id][0].toLowerCase())+'" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="260" height="190" rx="18" fill="#edf3ed"/>'+pictograms[id]+'</svg>';

const asset=name=>(import.meta.env.BASE_URL||'./')+'assets/'+name;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const row=(name,items)=>'<div class="lw-visual-steps" aria-label="'+esc(name)+'">'+items.map((x,i)=>'<div class="lw-visual-step"><span class="lw-visual-number">'+(i+1)+'</span><span>'+esc(x)+'</span></div>').join('<span class="lw-visual-connector" aria-hidden="true">→</span>')+'</div>';
export function familyVisual(id){const x=scenes[id];if(!x)throw Error('Unknown family illustration');return '<figure class="lw-family-visual"><img src="'+asset(x.image)+'" alt="'+esc(x.alt)+'" loading="lazy"/><figcaption>'+esc(x.label)+'</figcaption></figure>';}
export function designVisual(id){const x=designs[id];if(!x)throw Error('Unknown community design');return '<figure class="lw-design-visual">'+diagram(id)+'<figcaption>'+esc(x[0])+'</figcaption>'+row(x[0],x.slice(1))+'</figure>';}
export function eventVisual(id){const x=disruptions[id];if(!x)throw Error('Unknown community disruption');return '<figure class="lw-event-visual"><img src="'+asset(x.image)+'" alt="'+esc(x.alt)+'"/><figcaption><strong>'+esc(x.title)+'</strong>'+row(x.title,x.parts)+'</figcaption></figure>';}
export function outcomeVisual(result){const holds=result.metrics.outcome==='HOLDS',exposed=result.metrics.outcome==='EXPOSED';
 const status=holds?'Arthur can take part':exposed?'An essential response is missing':'Arthur needs another way';
 return '<div class="lw-impact-visual" role="group" aria-label="Arthur’s response and its consequences"><div class="lw-impact-status '+esc(result.metrics.outcome.toLowerCase())+'"><strong>'+esc(status)+'</strong><span>'+esc(result.route.reason)+'</span></div>'+row('What happened to Arthur',[
  'Disruption: '+({S1:'route',S2:'health concern',S3:'venue change'}[result.scenarioId]||'change'),
  result.route.designId?'A funded design helped':'The funded designs were not used',
  result.metrics.participation?'Arthur participated':'Participation did not happen'
 ])+'</div>';
}
export function futureVisual(future){const options=[
 ['FRAGMENTED','Support leaves gaps'],
 ['CONNECTED_FRAGILE','Works but fragile'],
 ['ADAPTABLE_ACCOUNTABLE','Adaptable and accountable']];
 return '<div class="lw-future-ribbon" role="group" aria-label="Three possible futures">'+options.map(([id,name],i)=>'<div class="lw-future-tile '+(id===future?'selected':'')+'"><span>'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(name)+'</strong>'+(id===future?'<small>YOUR FUTURE</small>':'')+'</div>').join('')+'</div>';
}
