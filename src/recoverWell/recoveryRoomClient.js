import {load,all} from '../parityEngine.js';
import {backend,isPreview} from '../xplayerBackend.js';
import {rpcRequest} from '../studioTransport.js';
import {hostSecret,controlRoom} from '../studioClient.js';
import {mutatePreview} from '../previewStore.js';
import {timerFor} from '../studioPolicy.js';
import {recoveryRoom,activeTable,startRecoveryTables,resolveRecoveryRoom,decisionPhases,roomBallot,roomTally} from './recoveryRoomRules.js';
const check=(old,s)=>{if(old.phase!==s.phase||old.xplayer_revision!==s.xplayer_revision)throw Error('The room changed. Refresh before continuing.');};
async function rpc(name,args){const r=await rpcRequest(await backend(),name,args);if(r.error){if(r.error.code==='PGRST202')throw Error('Recover Well needs backend migration 005 before live room play. Leave Well is unchanged.');throw r.error}return r.data}
export async function beginRecoveryRoom(old){const s=await load(old.code);check(old,s);const d=await all(s),scenarioId=['S1','S2','S3'][crypto.getRandomValues(new Uint32Array(1))[0]%3],changes=startRecoveryTables(s,d.teams,scenarioId);
 if(!isPreview)return rpc('abd_begin_recovery_room',{p_session:s.id,p_revision:s.xplayer_revision,p_host_token:hostSecret(s.code),p_scenario:scenarioId,p_changes:changes.map(t=>({id:t.id,recovery:t.game_state.recovery}))});
 return mutatePreview(db=>{const current=db.sessions.find(x=>x.id===s.id);check(s,current);for(const t of changes)db.teams.find(x=>x.id===t.id).game_state.recovery=t.game_state.recovery;current.studio_control={...current.studio_control,currentRound:'recover_well',completed:false,registrationOpen:false,recoveryScenario:scenarioId,timer:null};current.xplayer_revision++;return current});
}
export async function advanceRecoveryRoom(old,{force=false,random}={}){let s=await load(old.code);check(old,s);if(!recoveryRoom(s))throw Error('This is not the recovery round.');const d=await all(s);
 if(!force&&decisionPhases.includes(s.phase)&&s.phase!=='event'&&d.teams.some(t=>activeTable(t)&&roomBallot(t,s.phase)&&!roomTally(t,s.phase,d.players,d.votes).ready))throw Error('Waiting for all joined players at active tables to vote.');
 // A server-serialized close happens before the final ballot snapshot, including forced continuation.
 if(decisionPhases.includes(s.phase)&&s.studio_control.timer?.status!=='closed'){s=await controlRoom(s,'close');const closed=await all(s);return commitRecovery(s,closed,{force,random});}
 return commitRecovery(s,d,{force,random});
}
async function commitRecovery(s,d,options){const update=resolveRecoveryRoom(s,d.teams,d.players,d.votes,options);
 if(!isPreview)return rpc('abd_transition_recovery_room',{p_session:s.id,p_revision:s.xplayer_revision,p_expected_phase:s.phase,p_host_token:hostSecret(s.code),p_changes:update.changes.map(t=>({id:t.id,recovery:t.game_state.recovery})),p_next_phase:update.phase,p_completed:update.completed});
 return mutatePreview(db=>{const current=db.sessions.find(x=>x.id===s.id);check(s,current);for(const t of update.changes){const stored=db.teams.find(x=>x.id===t.id&&x.session_id===s.id);if(!stored||!activeTable(stored))throw Error('The participating tables changed. Refresh.');stored.game_state.recovery=t.game_state.recovery;}const kind=update.phase===s.phase&&update.changes.some(t=>t.game_state.recovery.runoff?.status==='open')?'runoff':'decision';current.phase=update.phase;current.studio_control={...current.studio_control,timer:timerFor(update.phase,kind),completed:update.completed};current.xplayer_revision++;return current});
}
export async function recordRecoverySharing(old,teamId,value){const s=await load(old.code);check(old,s);if(!['card','event'].includes(s.phase)||!recoveryRoom(s))throw Error('Record sharing before the event outcome.');const t=(await all(s)).teams.find(t=>t.id===teamId&&activeTable(t));if(!t)throw Error('Participating table not found.');const {applyRecoveryAction}=await import('./recoveryRun.js'),w=structuredClone(t.game_state.recovery);w.run=applyRecoveryAction(w.run,{id:'room:sharing:'+s.xplayer_revision,type:'shareMovement',value});if(!isPreview)return rpc('abd_record_recovery_sharing',{p_session:s.id,p_revision:s.xplayer_revision,p_host_token:hostSecret(s.code),p_table:teamId,p_run:w.run});return mutatePreview(db=>{const current=db.sessions.find(x=>x.id===s.id);check(s,current);db.teams.find(x=>x.id===teamId).game_state.recovery.run=w.run;current.xplayer_revision++;return current})}
