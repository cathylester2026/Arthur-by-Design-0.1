import {enterRecovery,freeze} from './leaveWellHandoff.js';
import {CAPABILITIES,CHOICES,COSTS,VERSION,scenario} from './recoveryContent.js';
import {resolveRecovery,recoveryResponseOptions} from './recoveryResolver.js';
export function createRecoveryRun({handoff,runId,policy='standalone',scenarioId='S2',facts={},lineage={}}){
 if(typeof runId!=='string'||!runId||runId.length>200)throw Error('A recovery run ID is required.');
 const inherited=enterRecovery(handoff,{policy});const identity={experienceMode:lineage.experienceMode||'independent',participantId:lineage.participantId||null,tableId:lineage.tableId||inherited.source.tableId||null,sessionId:lineage.sessionId||inherited.source.sessionId||null};if(!['independent','facilitated'].includes(identity.experienceMode)||Object.entries(identity).some(([k,v])=>k!=='experienceMode'&&v!==null&&(typeof v!=='string'||v.length>200)))throw Error('Invalid participant/table lineage.');scenario(scenarioId,facts);
 return freeze({schema:'rw.run.v1',version:VERSION,runId,policy,lineage:identity,handoff:inherited,scenarioId,facts:structuredClone(facts),phase:'brief',capital:7,change:6,investments:[],pendingCapability:null,strategy:null,prediction:null,shareMovement:false,baseline:null,result:null,response:null,revision:0,actions:[]});
}
const cap=id=>CAPABILITIES.find(c=>c.id===id);
export function inputFor(run){return {handoff:run.handoff,investments:run.investments,scenarioId:run.scenarioId,facts:run.facts,shareMovement:run.shareMovement}}
export function responseOptions(run){const r=recoveryResponseOptions(inputFor(run));return Object.fromEntries(Object.entries(r).map(([id,x])=>[id,{...x,cost:COSTS[id],affordable:run.capital>=COSTS[id].capital&&run.change>=COSTS[id].change}]))}
export function applyRecoveryAction(run,action){
 if(!action||typeof action.id!=='string'||!action.id||action.id.length>200)throw Error('An action ID is required.');
 const previous=run.actions.find(a=>a.id===action.id);if(previous){if(JSON.stringify(previous)!==JSON.stringify(action))throw Error('Action ID was reused with different content.');return run}
 const next=structuredClone(run),p=run.phase;const requirePhase=(...allowed)=>{if(!allowed.includes(p))throw Error('This action is not available at the current stage.');};
 const charge=cost=>{if(next.capital<cost.capital||next.change<cost.change)throw Error('Insufficient Capital or Change.');next.capital-=cost.capital;next.change-=cost.change};
 switch(action.type){
 case 'next':{
  const target={brief:'invest',activation:'design',designReveal:next.investments.length===2?'event':'strategy',impact:'respond',result:'journey'}[p];if(!target)throw Error('This screen needs a decision before continuing.');next.phase=target;break;
 }
 case 'invest':{
  requirePhase('invest');const c=cap(action.capabilityId);if(!c||next.investments.length>=2||next.investments.some(i=>CHOICES[i.designId].capabilityId===c.id))throw Error('Choose a different valid capability.');charge(c.cost);next.pendingCapability=c.id;next.phase='activation';break;
 }
 case 'design':{
  requirePhase('design');const choice=CHOICES[action.designId];if(!choice||choice.capabilityId!==next.pendingCapability)throw Error('Design does not match the purchased capability.');next.investments.push({designId:choice.id,strengthened:false});next.pendingCapability=null;next.phase='designReveal';break;
 }
 case 'strategy':{
  requirePhase('strategy');if(next.investments.length!==1)throw Error('Strategy applies to one first investment.');
  if(action.choice==='strengthen'){charge(COSTS.strengthen);next.investments[0].strengthened=true;next.strategy='strengthen';next.phase='event'}
  else if(action.choice==='extend'){if(!CAPABILITIES.some(c=>c.id!==CHOICES[next.investments[0].designId].capabilityId&&c.cost.capital<=next.capital&&c.cost.change<=next.change))throw Error('No second capability is affordable.');next.strategy='extend';next.phase='invest'}
  else throw Error('Unknown strategy.');break;
 }
 case 'prediction':requirePhase('event');if(!['YES','NOT SURE','NO'].includes(action.choice))throw Error('Unknown opinion.');next.prediction=action.choice;break;
 case 'shareMovement':requirePhase('event');if(typeof action.value!=='boolean'||!next.investments.some(i=>i.designId==='2A')||!next.investments.some(i=>i.designId==='3C'))throw Error('Only selected movement observations may be shared.');next.shareMovement=action.value;break;
 case 'revealImpact':requirePhase('event');next.baseline=resolveRecovery({...inputFor(next),response:'use'});next.phase='impact';break;
 case 'respond':{
  requirePhase('respond');const option=responseOptions(next)[action.choice];if(!option?.eligible||!option.affordable)throw Error('This response is not eligible or affordable.');charge(option.cost);next.response=action.choice;next.result=resolveRecovery({...inputFor(next),response:action.choice});next.phase='result';break;
 }
 default:throw Error('Unknown recovery action.');
 }
 next.revision++;next.actions.push(structuredClone(action));return freeze(next);
}
export function serializeRun(run){return JSON.stringify({schema:'rw.saved-run.v1',version:VERSION,entry:{handoff:run.handoff,runId:run.runId,policy:run.policy,scenarioId:run.scenarioId,facts:run.facts,lineage:run.lineage},actions:run.actions,result:run.result,finalBudget:{capital:run.capital,change:run.change}})}
export function restoreRun(text){if(typeof text!=='string'||text.length>1000000)throw Error('Saved recovery run is too large.');const data=JSON.parse(text);if(data.schema!=='rw.saved-run.v1'||data.version!==VERSION||!Array.isArray(data.actions)||data.actions.length>1000)throw Error('Unsupported recovery save.');const run=data.actions.reduce(applyRecoveryAction,createRecoveryRun(data.entry));if(JSON.stringify(run.result)!==JSON.stringify(data.result)||JSON.stringify({capital:run.capital,change:run.change})!==JSON.stringify(data.finalBudget))throw Error('Saved recovery result/budget does not match its decision log.');return run}
