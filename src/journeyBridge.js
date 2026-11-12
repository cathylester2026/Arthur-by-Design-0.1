// Browser-local continuation only. It does not authenticate conference completion or change either resolver.
import {createLeaveWellHandoff,validateHandoff,freeze} from './recoverWell/leaveWellHandoff.js';
import {restoreRun} from './recoverWell/recoveryRun.js';
export const JOURNEY_VERSION='arthur.connected.v1';
const prefix='arthur-connected-journey-v1:';
export const recoveryStorageKey=id=>'arthur-recover-connected-r6:'+id;
const canonical=x=>JSON.stringify(sort(x));
function sort(x){if(Array.isArray(x))return x.map(sort);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])]));return x}
const clone=x=>JSON.parse(JSON.stringify(x));
const current=()=>globalThis.__arthurLocation||globalThis.location;
const storageOf=options=>options?.storage||globalThis.__arthurStorage||globalThis.localStorage;
const allowedModes=new Set(['studio-solo','join','host']);
function safeId(id){if(typeof id!=='string'||!/^[a-zA-Z0-9-]{1,100}$/.test(id))throw Error('The connected journey reference is missing or invalid.');return id}
function fingerprint(source){return canonical({runId:source.runId,sessionId:source.sessionId,tableId:source.tableId,investments:source.investments,responseId:source.responseId,evaluation:source.evaluation,resolutionRecords:source.resolutionRecords})}
function safeReturn(value={}){if(!allowedModes.has(value.mode))throw Error('The original Leave Well route is not supported by this preview.');const result={mode:value.mode};for(const k of ['room','seat'])if(value[k]!=null){if(typeof value[k]!=='string'||value[k].length>200)throw Error('Invalid journey return route.');result[k]=value[k]}if(value.preview==='1')result.preview='1';return result}
export function returnContext(mode,params=new URLSearchParams(current()?.search||'')){const value={mode};for(const k of ['room','seat','preview'])if(params.get(k))value[k]=params.get(k);return safeReturn(value)}
function parseEntry(text){if(typeof text!=='string'||text.length>750000)throw Error('The saved connected journey is invalid or too large.');let entry;try{entry=JSON.parse(text)}catch{throw Error('The connected journey record could not be read. It has been preserved unchanged.')}
 if(entry.schema!==JOURNEY_VERSION)throw Error('Unsupported connected journey version.');safeId(entry.id);const handoff=validateHandoff(entry.handoff);if(handoff.source.kind!=='leave-well'||!handoff.source.completed||canonical(handoff)!==canonical(entry.handoff))throw Error('The saved handoff does not match its scoped Leave Well evidence.');if(entry.sourceFingerprint!==fingerprint(handoff.source))throw Error('The Leave Well history in this journey has changed.');
 const lineage=entry.lineage;if(!lineage||!['independent','facilitated'].includes(lineage.experienceMode)||Object.entries(lineage).some(([k,v])=>k!=='experienceMode'&&v!==null&&(typeof v!=='string'||v.length>200)))throw Error('Invalid journey lineage.');entry.sourceReturn=safeReturn(entry.sourceReturn);return freeze(entry);
}
export function getJourney(id,options={}){safeId(id);let text;try{text=storageOf(options).getItem(prefix+id)}catch{throw Error('This browser cannot read the connected journey. The earlier game record has not been changed.')}if(!text)throw Error('This connected journey is not saved on this device. Return to the completed Leave Well story here and choose Continue to Recover Well.');return parseEntry(text)}
export function connectLeaveWell({runId,team,completed,completedAt,sessionId=null,participantId=null,experienceMode='independent',sourceReturn,provenance},options={}){
 const now=options.now||(()=>new Date().toISOString()),uuid=options.uuid||(()=>crypto.randomUUID());
 const handoff=createLeaveWellHandoff({runId,team,completed,completedAt:completedAt||now(),sessionId,provenance:provenance||'Browser-local handoff derived from a completed Leave Well record. Not server-authenticated.'});
 const lineage={experienceMode,participantId,tableId:handoff.source.tableId,sessionId};if(!['independent','facilitated'].includes(experienceMode)||Object.entries(lineage).some(([k,v])=>k!=='experienceMode'&&v!==null&&(typeof v!=='string'||v.length>200)))throw Error('Invalid journey lineage.');
 const back=safeReturn(sourceReturn),signature=fingerprint(handoff.source),pointer=prefix+'source:'+canonical([runId,experienceMode,participantId||'host',lineage.tableId,sessionId]);let storage,existing;
 try{storage=storageOf(options);existing=storage.getItem(pointer)}catch{throw Error('Browser storage is needed to connect these rounds. Your Leave Well record is unchanged.')}
 if(existing){const entry=getJourney(existing,{storage});if(entry.sourceFingerprint!==signature)throw Error('This source run already has a different saved history. Its connected record has been preserved; start from a new completed Leave Well run.');return entry}
 const id=safeId(uuid()),entry={schema:JOURNEY_VERSION,id,createdAt:now(),handoff:clone(handoff),lineage,sourceReturn:back,sourceFingerprint:signature};parseEntry(JSON.stringify(entry));
 try{if(storage.getItem(prefix+id))throw Error('Journey reference already exists.');storage.setItem(prefix+id,JSON.stringify(entry));storage.setItem(pointer,id)}catch{throw Error('The connected journey could not be saved. Your earlier decisions remain unchanged; keep this tab open and retry when browser storage is available.')}
 return freeze(entry);
}
export function journeyURL(mode,entryOrId,extra={}){const id=typeof entryOrId==='string'?entryOrId:entryOrId.id;safeId(id);if(!['journey','recover-well'].includes(mode))throw Error('Unknown connected journey route.');const params={mode,journey:id};if(typeof entryOrId==='object'&&entryOrId.sourceReturn.preview==='1')params.preview='1';if(extra.review==='1')params.review='1';return '?'+new URLSearchParams(params)}
export const leaveWellURL=entry=>'?'+new URLSearchParams(safeReturn(entry.sourceReturn));
export function navigateJourney(url){const target=new URL(url,current()?.href||'https://example.test/');if(typeof window!=='undefined'&&window.frameElement&&parent.__arthurFrameDocument){window.frameElement.srcdoc=parent.__arthurFrameDocument(target.href)}else globalThis.location.href=target.href}
export function continueRecovery(source,options={}){const entry=connectLeaveWell(source,options);(options.navigate||navigateJourney)(journeyURL('journey',entry));return entry}
export function recoveryProgress(entry,options={}){let text;try{text=storageOf(options).getItem(recoveryStorageKey(entry.id))}catch{return {run:null,error:'The recovery save is unavailable in this browser.'}}if(!text)return {run:null,error:null};try{const run=restoreRun(text);if(canonical(run.handoff)!==canonical(entry.handoff)||canonical(run.lineage)!==canonical(entry.lineage))throw Error('Recovery save belongs to a different source or participant.');return {run,error:null}}catch(err){return {run:null,error:'The recovery save could not be restored and has been preserved: '+err.message}}}
