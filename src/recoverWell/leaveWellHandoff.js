export const HANDOFF_VERSION='rw.handoff.v1';
export const ADAPTER_VERSION='lw-causal-v2-to-rw-v1';
const model='causal-composite-readiness-v2';
const valid={ambient:['bedside','shared','dedicated'],wayfinding:['digital','layered','escort'],meds:['nurse','pharmacy','huddle'],command:['unit','center','liaison']};
export function freeze(value){if(value&&typeof value==='object'){Object.freeze(value);for(const x of Object.values(value))freeze(x)}return value}
const copy=x=>JSON.parse(JSON.stringify(x));
const fact=(state,scope,reason,source)=>({state,scope,reason,source});
export function createLeaveWellHandoff({runId,completedAt,team,completed,provenance='caller-supplied',sessionId=null}){
 if(completed!==true||!runId||typeof runId!=='string'||runId.length>200||!completedAt||!Number.isFinite(Date.parse(completedAt)))throw Error('A completed, identified Leave Well run is required.');
 if(!team||!Array.isArray(team.investments)||team.investments.length>2)throw Error('Invalid Leave Well portfolio.');
 const seen=new Set();for(const i of team.investments){if(!valid[i.capabilityId]?.includes(i.commitmentId)||seen.has(i.capabilityId)||typeof i.strengthened!=='boolean')throw Error('Invalid Leave Well design record.');seen.add(i.capabilityId)}
 if(team.investments.length===2&&team.investments.some(i=>i.strengthened))throw Error('Strengthen and Extend cannot be combined in the source portfolio.');
 const v=team.game_state?.evaluation;if(!v||v.model!==model||!['HOLDS','STRAINED','EXPOSED'].includes(v.outcome)||!Array.isArray(v.details))throw Error('Unsupported or missing Leave Well evaluation version.');
 const response=team.game_state.responseId;if(!['use','adapt','escalate'].includes(response)||v.responseId!==response)throw Error('The executed source response and saved result must agree.');
 const info=v.details.find(d=>d.id==='information'),route=v.details.find(d=>d.id==='route'),coord=v.details.find(d=>d.id==='coordination');
 if(!info||!route||!coord)throw Error('Leave Well demand-level evidence is required.');
 const informationHolds=['ABSORBED','HOLDS'].includes(info.outcome)&&Array.isArray(info.readinessGaps)&&!info.readinessGaps.length;
 const explicitOpen=Array.isArray(info.readinessGaps)&&info.readinessGaps.length>0;
 const planState=informationHolds?'established':explicitOpen?'open':'unknown';
 const portable=team.investments.some(i=>i.capabilityId==='meds'&&i.commitmentId==='huddle')&&informationHolds&&info.realizedReadiness?.downstreamParticipating===true;
 const source={kind:'leave-well',runId,sessionId,tableId:typeof team.id==='string'?team.id:null,completed:true,completedAt,provenance,engineVersion:v.model,eventId:v.eventId,investments:copy(team.investments),responseId:response,evaluation:copy(v),resolutionRecords:copy(team.game_state.applied_decisions||{})};
 const facts={
  verifiedTransitionPlan:fact(planState,['late-discharge-plan-change','clinical-context-at-transition'],informationHolds?'The source model records the changed plan holding with no unresolved plan gate.':explicitOpen?'The source model records an unresolved clinical confirmation gate.':'The saved result does not establish complete plan confirmation.',runId),
  portableMedicationContext:fact(portable?'established':'unknown',['medication-context','participating-settings-at-transition'],portable?'Confirmed medication context travels only across the participating scope.':'No complete portable-medication claim is established by this record.',runId),
  hospitalMovement:fact(['ABSORBED','HOLDS'].includes(route.outcome)?'established':'open',['hospital-departure-only'],'Hospital movement does not imply an adapted home or approved rehab equipment.',runId),
  hospitalHandoff:fact(['ABSORBED','HOLDS'].includes(coord.outcome)?'established':'open',['departure-handoff-only'],'Departure ownership is not ongoing home-care or clinical ownership.',runId),
  continuingHomeOwner:fact('unknown',['recovery-home-care'],'Leave Well does not establish continuing recovery-service acceptance.',runId)
 };
 return freeze({schema:HANDOFF_VERSION,adapter:ADAPTER_VERSION,source,facts});
}
export function validateHandoff(input){
 if(!input||input.schema!==HANDOFF_VERSION||input.adapter!==ADAPTER_VERSION)throw Error('Unsupported recovery handoff schema/adapter.');
 if(input.source?.kind==='leave-well')return createLeaveWellHandoff({runId:input.source.runId,completedAt:input.source.completedAt,completed:input.source.completed,provenance:input.source.provenance,sessionId:input.source.sessionId,team:{id:input.source.tableId,investments:input.source.investments,game_state:{evaluation:input.source.evaluation,responseId:input.source.responseId,applied_decisions:input.source.resolutionRecords}}});
 if(input.source?.kind==='authored-standalone')return standaloneHandoff(input.source.preset);
 throw Error('Unknown recovery entry provenance.');
}
export function standaloneHandoff(preset='supported'){
 if(!['supported','open'].includes(preset))throw Error('Unknown authored starting case.');
 return freeze({schema:HANDOFF_VERSION,adapter:ADAPTER_VERSION,source:{kind:'authored-standalone',preset,runId:'authored-'+preset,completed:false,provenance:'Declared training case; no Leave Well play is claimed.'},facts:{verifiedTransitionPlan:fact(preset==='supported'?'established':'open',['late-discharge-plan-change','clinical-context-at-transition'],'Explicit authored starting condition; not a measured clinical fact.','authored'),portableMedicationContext:fact('unknown',['medication-context'],'No cross-setting service supplied.','authored'),hospitalMovement:fact('unknown',['hospital-departure-only'],'Not played.','authored'),hospitalHandoff:fact('unknown',['departure-handoff-only'],'Not played.','authored'),continuingHomeOwner:fact('unknown',['recovery-home-care'],'New acceptance must be established.','authored')}});
}
export function enterRecovery(handoff,{policy='standalone'}={}){
 const h=validateHandoff(handoff);if(!['standalone','aimedx'].includes(policy))throw Error('Unknown journey policy.');
 if(policy==='aimedx'&&(h.source.kind!=='leave-well'||!h.source.completed))throw Error('AIMedX requires a completed linked Leave Well run.');
 return h;
}
