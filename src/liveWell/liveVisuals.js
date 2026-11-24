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
const asset=name=>(import.meta.env.BASE_URL||'./')+'assets/'+name;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const row=(name,items)=>'<div class="lw-visual-steps" aria-label="'+esc(name)+'">'+items.map((x,i)=>'<div class="lw-visual-step"><span class="lw-visual-number">'+(i+1)+'</span><span>'+esc(x)+'</span></div>').join('<span class="lw-visual-connector" aria-hidden="true">→</span>')+'</div>';
export function familyVisual(id){const x=scenes[id];if(!x)throw Error('Unknown family illustration');return '<figure class="lw-family-visual"><img src="'+asset(x.image)+'" alt="'+esc(x.alt)+'" loading="lazy"/><figcaption>'+esc(x.label)+'</figcaption></figure>';}
export function designVisual(id){const x=designs[id];if(!x)throw Error('Unknown community design');return '<figure class="lw-design-visual"><figcaption>'+esc(x[0])+'</figcaption>'+row(x[0],x.slice(1))+'</figure>';}
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
