import {createLeaveWellHandoff} from './leaveWellHandoff.js';
import {createRecoveryRun,applyRecoveryAction,responseOptions,restoreRun,serializeRun} from './recoveryRun.js';
import {CAPABILITIES,CHOICES} from './recoveryContent.js';
export const RECOVERY_ROOM_VERSION='rw.room.v1';
export const recoveryRoom=s=>s.studio_control?.currentRound==='recover_well';
export const decisionPhases=['invest','design','adapt','event','respond'];
export const activeTable=t=>t.game_state?.participation!=='withdrawn'&&t.status!=='inactive';
export const recoveryState=t=>t.game_state?.recovery;
const clone=x=>structuredClone(x);
const phaseFor={invest:'invest',design:'design',adapt:'strategy',event:'event',respond:'respond'};
export function roomOptions(t,phase){const r=recoveryState(t)?.run;if(!activeTable(t)||!r||r.phase!==phaseFor[phase])return [];
 if(phase==='invest')return CAPABILITIES.filter(c=>!r.investments.some(i=>CHOICES[i.designId].capabilityId===c.id)&&r.capital>=c.cost.capital&&r.change>=c.cost.change).map(c=>c.id);
 if(phase==='design')return CAPABILITIES.find(c=>c.id===r.pendingCapability)?.choices.map(d=>d.id)||[];
 if(phase==='adapt')return [r.capital>=1&&r.change>=1&&'strengthen',CAPABILITIES.some(c=>!r.investments.some(i=>CHOICES[i.designId].capabilityId===c.id)&&r.capital>=c.cost.capital&&r.change>=c.cost.change)&&'extend'].filter(Boolean);
 if(phase==='event')return ['YES','NOT SURE','NO'];
 return Object.entries(responseOptions(r)).filter(([,o])=>o.eligible&&o.affordable).map(([id])=>id);
}
export function roomBallot(t,phase){const w=recoveryState(t);if(!w||w.pending?.phase===phase)return null;const options=roomOptions(t,phase);if(!options.length)return null;const r=w.run,n=r.investments.length+1,key='rw:'+({invest:'capability'+n,design:'design'+n,adapt:'strategy',event:'prediction',respond:'response'}[phase]);const runoff=phase!=='event'&&w.runoff?.phase===phase&&w.runoff.status==='open'&&w.runoff.baseKey===key?w.runoff:null;return {key:runoff?.key||key,baseKey:key,options:runoff?.options||options,runoff:!!runoff};}
export function roomTally(t,phase,players,votes){const b=roomBallot(t,phase),registered=players.filter(p=>p.team_id===t.id),ids=new Set(registered.map(p=>p.id)),seen=new Map();for(const v of votes)if(b&&v.stage_id==='recover_well'&&v.team_id===t.id&&ids.has(v.player_id)&&v.decision===b.key&&b.options.includes(v.choice))seen.set(v.player_id,v);const people=registered.filter(p=>p.seat_active!==false||seen.has(p.id)),counts={};for(const v of seen.values())counts[v.choice]=(counts[v.choice]||0)+1;const max=Math.max(0,...Object.values(counts)),leaders=max?Object.keys(counts).filter(k=>counts[k]===max):[];return {team:t,ballot:b,people,counts,leaders,cast:seen.size,ready:!!b&&people.length>0&&seen.size===people.length};}
export function publishBallot(t,phase){const next=clone(t),w=recoveryState(next);if(w)w.ballot=roomBallot(next,phase);return next;}
export function startRecoveryTables(session,teams,scenarioId,now=new Date().toISOString()){
 if(session.phase!=='journey'||!session.studio_control?.completed||recoveryRoom(session))throw Error('Complete Leave Well before beginning the recovery round.');
 const selected=teams.filter(t=>activeTable(t)&&t.game_state?.evaluation);if(!selected.length)throw Error('No completed participating Leave Well table is available.');
 return selected.map(t=>{const next=clone(t),handoff=createLeaveWellHandoff({runId:'lw:'+session.id+':'+t.id,completedAt:now,completed:true,sessionId:session.id,team:t,provenance:'Completed Leave Well table in the same managed room.'});next.game_state.recovery={schema:RECOVERY_ROOM_VERSION,run:createRecoveryRun({runId:'rw:'+session.id+':'+t.id,handoff,policy:'aimedx',scenarioId,lineage:{experienceMode:'facilitated',tableId:t.id,sessionId:session.id,participantId:null}}),decisions:{},pending:null,runoff:null,poll:null,ballot:null,completed:false};return next});
}
function step(t,type,values,key){const w=recoveryState(t);w.run=applyRecoveryAction(w.run,{id:'room:'+key,type,...values});}
function applyWinner(t,phase,pick,key){const next=clone(t),w=recoveryState(next);if(w.decisions[key])return next;const type={invest:'invest',design:'design',adapt:'strategy',respond:'respond'}[phase],field={invest:'capabilityId',design:'designId',adapt:'choice',respond:'choice'}[phase];if(!roomOptions(next,phase).includes(pick.choice))throw Error('The table choice is no longer available.');step(next,type,{[field]:pick.choice},key);w.decisions[key]=clone(pick);w.pending=null;if(w.runoff?.status==='open')w.runoff={...w.runoff,status:'resolved',choice:pick.choice,source:pick.source,runoffCounts:pick.counts};return next;}
function resolvePick(r,phase,random){if(r.cast)return {choice:r.leaders.length===1?r.leaders[0]:random(r.leaders),source:r.leaders.length===1?(r.ballot.runoff?'runoff_vote':'table_vote'):(r.people.some(p=>p.seat_active!==false)?'random_after_runoff_tie':'random_no_active_voters')};if(r.ballot.runoff)return {choice:random(r.ballot.options),source:'random_no_runoff_votes'};const opts=roomOptions(r.team,phase);if(phase==='respond')return {choice:'use',source:'default_use_no_votes'};if(phase==='adapt'&&opts.includes('strengthen'))return {choice:'strengthen',source:'default_strengthen_no_votes'};return {choice:opts.length?random(opts):null,source:'default_random_no_votes'};}
export function resolveRecoveryRoom(session,teams,players,votes,{force=false,random=xs=>xs[crypto.getRandomValues(new Uint32Array(1))[0]%xs.length]}={}){
 if(!recoveryRoom(session))throw Error('This room is not in Recover Well.');if(session.studio_control.completed)throw Error('Recover Well is complete. Review the saved table results.');const phase=session.phase,all=teams.map(clone),active=all.filter(t=>activeTable(t)&&recoveryState(t));let nextPhase;
 if(!decisionPhases.includes(phase)){
  nextPhase={journey:'rules',rules:'invest',activation:'design',designReveal:active.some(t=>recoveryState(t).run.phase==='designReveal'&&recoveryState(t).run.investments.length===1)?'adapt':'card',card:'event',impact:'respond',result:'principles',principles:'journey'}[phase];if(!nextPhase)throw Error('Unknown recovery screen.');
  for(const t of active){const r=recoveryState(t).run;if((phase==='rules'&&r.phase==='brief')||(phase==='activation'&&r.phase==='activation')||(phase==='designReveal'&&r.phase==='designReveal')||(phase==='impact'&&r.phase==='impact')||(phase==='principles'&&r.phase==='result'))step(t,'next',{},'next:'+phase+':'+r.revision);if(phase==='principles')recoveryState(t).completed=true;}
 }else if(phase==='event'){
  for(const t of active){const r=roomTally(t,phase,players,votes),w=recoveryState(t);if(w.run.phase!=='event')continue;w.poll={counts:r.counts,cast:r.cast,eligible:r.people.length,label:!r.cast?'NOT RECORDED':r.leaders.length===1?r.leaders[0]:'SPLIT'};step(t,'revealImpact',{},'prediction-reveal');}nextPhase='impact';
 }else{
  const rows=active.map(t=>{const pending=recoveryState(t).pending;return pending?.phase===phase?{team:t,pending:true,ready:true,ballot:{baseKey:pending.key},people:[],...pending}:roomTally(t,phase,players,votes)}).filter(r=>r.ballot);
  if(!force&&rows.some(r=>!r.ready))throw Error('Waiting for all joined players at active tables to vote.');
  const firstTies=rows.filter(r=>!r.pending&&r.leaders.length>1&&!r.ballot.runoff&&r.people.some(p=>p.seat_active!==false));
  if(firstTies.length){for(const r of rows){if(r.pending||r.ballot.runoff)continue;const w=recoveryState(r.team);if(firstTies.includes(r))w.runoff={phase,baseKey:r.ballot.baseKey,key:r.ballot.baseKey+'__runoff',options:r.leaders,status:'open',firstCounts:r.counts,firstCast:r.cast,firstWindow:clone(session.studio_control.timer)};else w.pending={phase,key:r.ballot.baseKey,...resolvePick(r,phase,random),counts:r.counts,cast:r.cast,eligible:r.people.length,window:clone(session.studio_control.timer)};}nextPhase=phase;
  }else{for(const r of rows){const pick=r.pending?r:{...resolvePick(r,phase,random),counts:r.counts,cast:r.cast,eligible:r.people.length,window:clone(session.studio_control.timer)};if(!pick.choice)throw Error('No legal table default.');if(r.ballot.runoff){pick.firstCounts=recoveryState(r.team).runoff.firstCounts;pick.firstWindow=recoveryState(r.team).runoff.firstWindow;}const updated=applyWinner(r.team,phase,pick,r.ballot.baseKey);Object.assign(r.team,updated);}nextPhase={invest:'activation',design:'designReveal',adapt:active.some(t=>recoveryState(t).run.phase==='invest')?'invest':'card',respond:'result'}[phase];}
 }
 const changes=active.map(t=>publishBallot(t,nextPhase));return {phase:nextPhase,changes,completed:phase==='principles'};
}
export function validateRoomRecovery(w){if(w.schema!==RECOVERY_ROOM_VERSION)throw Error('Unknown recovery room save');return restoreRun(serializeRun(w.run));}
