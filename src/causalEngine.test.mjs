import {causalChoices,evaluatePortfolio,compareEvaluations,responseEligibility} from './causalEngine.js';
const events=['route','information','coordination'];let direct=0,strength=0;
for(const [cap,choices] of Object.entries(causalChoices))for(const id of Object.keys(choices))for(const eventId of events){
 const base={activations:[{capabilityId:cap,commitmentId:id}],eventId,response:'use'};
 const a=evaluatePortfolio(base,eventId,'use');if(!a.outcome||!a.causalSummary[0])throw Error(`${cap}/${id}/${eventId}`);direct++;
 const b=evaluatePortfolio({activations:[{capabilityId:cap,commitmentId:id,strengthened:true}]},eventId,'use');if(b.raw<a.raw)throw Error(`strengthen regressed ${cap}/${id}/${eventId}`);strength++;
}
const mixed=[['ambient','shared'],['wayfinding','layered'],['meds','pharmacy'],['command','center'],['ambient','dedicated'],['wayfinding','escort']];let portfolios=0;
for(let i=0;i<mixed.length;i++)for(let j=i+1;j<mixed.length&&portfolios<12;j++){evaluatePortfolio({activations:[{capabilityId:mixed[i][0],commitmentId:mixed[i][1]},{capabilityId:mixed[j][0],commitmentId:mixed[j][1]}]},events[portfolios%3]);portfolios++}
const blocked=evaluatePortfolio({activations:[{capabilityId:'meds',commitmentId:'huddle'}]},'information');if(!blocked.effects[0].blocked)throw Error('3C prerequisite not enforced');
const resolved=evaluatePortfolio({dependencies:['authoritativeMedicationPlan'],activations:[{capabilityId:'meds',commitmentId:'huddle'}]},'information');if(resolved.raw<=blocked.raw)throw Error('3C dependency did not help');
const noAdapt=responseEligibility({activations:[{capabilityId:'meds',commitmentId:'nurse'}]},'adapt','route');if(noAdapt.eligible)throw Error('generic adapt still eligible');
const compare=compareEvaluations(blocked,resolved);if(!compare.summary)throw Error('comparison missing');
console.log(`PASS ${direct} direct + ${strength} strengthened + ${portfolios} mixed + dependency/response/revision cases = ${direct+strength+portfolios+4} deterministic checks`);
