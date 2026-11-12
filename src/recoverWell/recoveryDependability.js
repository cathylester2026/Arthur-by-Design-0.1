import {STRENGTHEN} from './recoveryContent.js';
const requirements={
 '1B':['routineAlternativeAvailable','routineAlternativeFits'],
 '2B':['rehabAlternativeAvailable','rehabAlternativeFits'],
 '4A':['alternateRouteAvailable','alternateRouteAccepted','alternateRouteCapacity'],
 '4B':['transferFallbackAvailable','transferFallbackAccepted','transferFallbackWithinWindow'],
 '4C':['backupNavigatorAccepted','backupNavigatorCoverage']
};
export function dependabilityPreview(designId,facts){
 const keys=requirements[designId];
 if(!keys)return {commitment:STRENGTHEN[designId],supported:null,missing:[],explanation:'The funded commitment still needs its scenario-specific source, task, review or fallback conditions. No higher outcome is guaranteed.'};
 if(keys.some(k=>!(k in facts)))return {commitment:STRENGTHEN[designId],supported:null,missing:[],explanation:'This event does not exercise that particular fallback. Funding it does not resolve a different clinical or task requirement.'};
 const missing=keys.filter(k=>facts[k]!==true);
 return {commitment:STRENGTHEN[designId],supported:missing.length===0,missing,
 explanation:missing.length?'The actual alternative’s readiness is not established in this case. Funding this commitment will not make those missing conditions true.':'The actual alternative is available under the declared facts. Strengthen prepares its use within the existing task and service limits.'};
}
