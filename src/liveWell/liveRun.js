import {makeLiveStart,validatePortfolio,responseOptions,evaluateLiveWell,DESIGNS,CAPABILITIES} from './liveResolver.js';
import {selectPlayProfile} from './liveBalance.js';
import {SCENARIOS} from './liveResolver.js';
export const RUN_SCHEMA='live.run.v1';
const phases=['intro','family','design','strategy','secondFamily','secondDesign','event','response','outcome','futures','finale'];
const freeze=x=>Object.freeze(x);
const copy=x=>structuredClone(x);
const family=id=>CAPABILITIES.find(f=>f.id===id);
export function createLiveRun({runId,start=makeLiveStart(),scenarioId=null,lineage={}}){
 if(typeof runId!=='string'||!runId||runId.length>200)throw Error('Valid run ID required.');
 if(scenarioId===null){
  const ids=Object.keys(SCENARIOS);
  const hash=Array.from(runId).reduce((acc,c)=>Math.imul(acc^c.charCodeAt(0),16777619)>>>0,2166136261);
  scenarioId=ids[hash%ids.length];
 }
 const profile=selectPlayProfile(scenarioId,runId);
 return freeze({schema:RUN_SCHEMA,runId,source:start,scenarioId,profileId:profile.id,
  phase:'intro',pendingFamily:null,investments:[],strategy:null,response:null,prediction:null,
  result:null,lineage:{experienceMode:lineage.experienceMode==='facilitated'?'facilitated':'independent'},
  capital:7,change:6,actions:[],revision:0});
}
function assertRun(r){if(!r||r.schema!==RUN_SCHEMA||!phases.includes(r.phase)||!r.runId||!r.source||!r.profileId)throw Error('Invalid Live Well game state.')}
function recalc(r){let sum={capital:0,change:0};
 for(const item of r.investments){const d=DESIGNS[item.designId];if(!d)throw Error('Invalid investment');sum.capital+=d.cost.capital;sum.change+=d.cost.change;}
 if(r.strategy==='strengthen'){sum.capital++;sum.change++;}
 if(sum.capital>7||sum.change>6)throw Error('Insufficient Capital or Change.');
 r.capital=7-sum.capital;r.change=6-sum.change;
}
export function applyLiveAction(run,action){
 assertRun(run);
 if(!action||typeof action.id!=='string'||!action.id||action.id.length>200)throw Error('Action ID required.');
 const previous=run.actions.find(a=>a.id===action.id);
 if(previous){if(JSON.stringify(previous)!==JSON.stringify(action))throw Error('Action ID collision.');return run;}
 const next=copy(run);const allowed=(...p)=>{if(!p.includes(run.phase))throw Error('Not available in the current chapter screen.');};
 switch(action.type){
 case 'next':{
  allowed('intro','event','outcome','futures');next.phase={intro:'family',event:'response',outcome:'futures',futures:'finale'}[run.phase];break;
 }
 case 'family':{
  allowed('family','secondFamily');
  if(!family(action.familyId))throw Error('Invalid investment family.');
  if(run.phase==='secondFamily'&&run.investments.some(x=>DESIGNS[x.designId].familyId===action.familyId))throw Error('Choose a different investment family.');
  next.pendingFamily=action.familyId;next.phase=run.phase==='family'?'design':'secondDesign';break;
 }
 case 'design':{
  allowed('design','secondDesign');
  if(!DESIGNS[action.designId]||DESIGNS[action.designId].familyId!==run.pendingFamily)throw Error('Choose one of this family’s designs.');
  if(run.investments.some(x=>DESIGNS[x.designId].familyId===run.pendingFamily))throw Error('Already invested in that family.');
  const d=DESIGNS[action.designId];
  if(next.capital<d.cost.capital||next.change<d.cost.change)throw Error('Insufficient Capital or Change.');
  next.investments.push({designId:action.designId,strengthened:false});next.pendingFamily=null;
  next.phase=run.phase==='design'?'strategy':'event';recalc(next);break;
 }
 case 'strategy':{
  allowed('strategy');
  if(action.choice==='strengthen'){
   if(next.capital<1||next.change<1)throw Error('Insufficient Capital or Change.');
   next.strategy='strengthen';next.investments[0].strengthened=true;next.phase='event';recalc(next);
  }else if(action.choice==='extend'){
   const possible=CAPABILITIES.filter(f=>f.id!==DESIGNS[next.investments[0].designId].familyId&&next.capital>=f.cost.capital&&next.change>=f.cost.change);
   if(!possible.length)throw Error('No other family fits the remaining resources.');
   next.strategy='extend';next.phase='secondFamily';
  }else throw Error('Choose Strengthen or Extend.');
  break;
 }
 case 'respond':{
  allowed('response');if(!next.strategy)throw Error('Select a portfolio before responding.');
  validatePortfolio({investments:next.investments,strategy:next.strategy});
  const opts=responseOptions({investments:next.investments,strategy:next.strategy,scenarioId:next.scenarioId});
  if(!opts[action.choice]?.affordable)throw Error('Response unavailable or over budget.');
  next.response=action.choice;
  const p=selectPlayProfile(next.scenarioId,next.runId);
  next.result=evaluateLiveWell({start:next.source,investments:next.investments,strategy:next.strategy,scenarioId:next.scenarioId,response:next.response,facts:p.facts});
  next.capital=next.result.remaining.capital;next.change=next.result.remaining.change;next.phase='outcome';break;
 }
 default:throw Error('Unknown Live Well action.');
 }
 next.revision++;next.actions.push({...action});
 return freeze(next);
}
export function serializeLiveRun(run){assertRun(run);return JSON.stringify(run)}
export function restoreLiveRun(text){
 if(typeof text!=='string'||text.length>450000)throw Error('Invalid saved Live Well record.');
 let raw;try{raw=JSON.parse(text)}catch{throw Error('Saved Live Well record cannot be parsed.')}
 assertRun(raw);
 const initial=createLiveRun({runId:raw.runId,start:raw.source,scenarioId:raw.scenarioId,lineage:raw.lineage});
 let replay=initial;
 if(!Array.isArray(raw.actions)||raw.actions.length>70)throw Error('Invalid action history.');
 for(const action of raw.actions)replay=applyLiveAction(replay,action);
 if(JSON.stringify(replay)!==JSON.stringify(raw))throw Error('Saved Live Well record does not match its replayed decisions.');
 return replay;
}
