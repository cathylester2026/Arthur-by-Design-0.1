import {causalChoices,evaluatePortfolio,responseEligibility,compareEvaluations,dependencySet} from './causalEngine.js';
const costs={ambient:[3,2],wayfinding:[2,2],meds:[3,3],command:[5,5]},caps=Object.keys(causalChoices),events=['route','information','coordination'],responses=['use','adapt','escalate'];
let seed=24051;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296),pick=a=>a[Math.floor(rnd()*a.length)];
let runs=[],errors=[];
for(let n=1;n<=120;n++){
 let capital=7,change=6,acts=[],c1=pick(caps),id1=pick(Object.keys(causalChoices[c1]));capital-=costs[c1][0];change-=costs[c1][1];acts.push({capabilityId:c1,commitmentId:id1});
 if(capital>=1&&change>=1&&rnd()<.5){capital--;change--;acts[0].strengthened=true}else{let legal=caps.filter(c=>c!==c1&&costs[c][0]<=capital&&costs[c][1]<=change);if(legal.length){let c2=pick(legal);capital-=costs[c2][0];change-=costs[c2][1];acts.push({capabilityId:c2,commitmentId:pick(Object.keys(causalChoices[c2]))})}}
 let eventId=events[n%3],wanted=pick(responses),elig=responseEligibility({activations:acts},wanted,eventId),response=elig.eligible?wanted:'use',r=evaluatePortfolio({activations:acts,eventId,response},eventId,response);
 if(r.effects.some(e=>e.blocked)&&r.outcome==='ABSORBED')errors.push(`blocked absorbed ${n}`);
 if(Object.values(r.scores).some(v=>v<0||v>3))errors.push(`score range ${n}`);
 let i=Math.floor(rnd()*acts.length),old=acts[i],alt=pick(Object.keys(causalChoices[old.capabilityId]).filter(x=>x!==old.commitmentId)),revised=structuredClone(acts);revised[i].commitmentId=alt;revised[i].strengthened=false;let after=evaluatePortfolio({activations:revised,eventId,response},eventId,response);let cmp=compareEvaluations(r,after);if(!cmp.summary)errors.push(`comparison ${n}`);
 runs.push({outcome:r.outcome,eventId,response,acts,raw:r.raw,after:after.outcome});
}
let distribution=Object.fromEntries(['ABSORBED','STRAINED','EXPOSED'].map(k=>[k,runs.filter(r=>r.outcome===k).length]));
// targeted truth tests
let p3c=evaluatePortfolio({activations:[{capabilityId:'meds',commitmentId:'huddle'}]},'information','use');if(!p3c.effects[0].blocked)errors.push('3C alone not blocked');
let p3b3c=evaluatePortfolio({activations:[{capabilityId:'meds',commitmentId:'pharmacy'},{capabilityId:'ambient',commitmentId:'shared'}]},'information','use');if(!p3b3c.dependencies.includes('authoritativeMedicationPlan'))errors.push('3B authoritative missing');
let p3as=evaluatePortfolio({activations:[{capabilityId:'meds',commitmentId:'nurse',strengthened:true}]},'information','use');if(!p3as.dependencies.includes('authoritativeMedicationPlan'))errors.push('strengthened 3A authoritative missing');
let adapt2a=responseEligibility({activations:[{capabilityId:'wayfinding',commitmentId:'digital'}]},'adapt','route');if(!adapt2a.eligible)errors.push('2A adapt unavailable');
let esc3a=responseEligibility({activations:[{capabilityId:'meds',commitmentId:'nurse'}]},'escalate','information');if(!esc3a.eligible)errors.push('3A escalation unavailable');
console.log(JSON.stringify({distribution,errors,total:runs.length,targeted:{p3c:p3c.outcome,p3b3c:p3b3c.outcome,p3as:p3as.outcome,adapt2a,esc3a}},null,2));
if(errors.length)process.exit(2);
