import {activeReflection,publicReflectionData} from './journeyReflections.js';
import {recoveryRoom,roomBallot} from './recoverWell/recoveryRoomRules.js';
import {rpcRequest} from './studioTransport.js';
import {previewSnapshot} from './previewStore.js';
import {admit,controlRoom,submitStudioVote,managedRoomData} from './studioClient.js';
import {votingOpen} from './studioPolicy.js';
import {isOnboarding,nextOnboarding,prevOnboarding} from './onboardingRuntime.js';
import {FLOW} from './leaveWellExperience.js';
import {spendCapability,canStrengthen,spendResponse,evaluateTable} from './xplayerRules.js';
import {DECISION_PHASES,baseDecision,allowedChoices,ballot,tally,nextDecisionPhase} from './leaveWellXplayerFlow.js';
import {backend,subscribe,create,transition,isPreview} from './xplayerBackend.js';
export const PLAYER='abd-parity-player',ROOM='abd-parity-room';
export const createRoom=create,sub=subscribe;
async function rows(q){const r=await q;if(r.error)throw r.error;return r.data}
export async function load(code){const sb=await backend();if(isPreview)return rows(sb.from('sessions').select('*').eq('code',code.toUpperCase()).single());const start=Date.now(),value=await rows(rpcRequest(sb,'abd_studio_session',{p_code:code}));value._clockOffset=Date.parse(value.studio_server_now)-(start+Date.now())/2;return value}
export async function all(s){
 if(s.studio_managed&&!isPreview)return managedRoomData(s);
 const sb=await backend();
 async function collect(table){if(isPreview)return rows(sb.from(table).select('*').eq('session_id',s.id));const result=[];for(let offset=0;;offset+=500){const page=await rows(sb.from(table).select('*').eq('session_id',s.id).order('id').range(offset,offset+499));result.push(...page);if(page.length<500)return result}}
 const [teams,players,votes]=await Promise.all(['teams','players','votes'].map(collect));const snapshot=isPreview?previewSnapshot():null;const solos=snapshot?.admissions?.filter(a=>a.session_id===s.id&&a.mode==='solo')||[],events=snapshot?.solo_events?.filter(e=>e.session_id===s.id)||[];return {teams,players,votes,...(snapshot?publicReflectionData(s,snapshot):{}),soloStats:{registered:solos.length,started:new Set(events.filter(e=>e.type==='started').map(e=>e.participant_id)).size,completed:new Set(events.filter(e=>e.type==='completed').map(e=>e.participant_id)).size}};
}
export function phase(s,p){return transition(s,[],p)}
export async function completeJourney(session){const fresh=await load(session.code);if(fresh.phase!==session.phase||Number(fresh.xplayer_revision||0)!==Number(session.xplayer_revision||0))throw Error('This host view is out of date.');if(fresh.phase!=='principles')throw Error('Finish the discussion before completing Leave Well.');const d=await all(fresh);return transition(fresh,d.teams.map(t=>({...t,game_state:{...t.game_state,journey_complete:true}})),'journey')}
export function move(s,n){if(s.phase==='designReveal'&&n>=0)return all(s).then(d=>phase(s,d.teams.some(t=>(t.investments||[]).length>=2||t.game_state?.second_round_attempted)?'event':'adapt'));if(s.phase==='principles')return completeJourney(s);if(s.phase==='finalReveal')return phase(s,'principles');if(n<0)throw Error('Review does not rewind committed decisions.');if(isOnboarding(s.phase))return phase(s,nextOnboarding(s.phase));const i=Math.max(0,FLOW.indexOf(s.phase));return phase(s,FLOW[Math.min(FLOW.length-1,i+1)])}
export async function reveal(s){return s}
export async function join({session,...props}){const result=await admit(session,'facilitated',props);return {player:result.player,team:result.team}}
export async function vote({session,team,player,key,choice}){
 const fresh=await load(session.code);if(activeReflection(fresh))throw Error('Follow the facilitator. A reflection pause is open.');const d=await all(fresh),t=d.teams.find(t=>t.id===team.id),p=d.players.find(p=>p.id===player.id&&p.team_id===team.id);
 if(!t||!p||p.seat_active===false)throw Error('Player is not registered at this table.');
 if(recoveryRoom(fresh)){const b=roomBallot(t,fresh.phase);if(!votingOpen(fresh)||!b||b.key!==key||!b.options.includes(choice))throw Error('Follow the facilitator: this recovery ballot is closed or changed.');if(fresh.studio_managed&&!isPreview){await submitStudioVote(fresh,p,key,choice);return}const sb=await backend();await rows(sb.from('votes').upsert({session_id:fresh.id,team_id:t.id,player_id:p.id,stage_id:'recover_well',decision:key,choice},{onConflict:'player_id,stage_id,decision'}));return;}
 if(key==='opening_challenge'){if(!votingOpen(fresh))throw Error('Voting is closed. Follow the facilitator.');if(fresh.phase!=='opening')throw Error('The opening question has closed.');if(typeof choice!=='string'||!choice.trim()||choice.length>500)throw Error('Enter up to 500 characters.')}
 else if(key.startsWith('reflection:')){if(typeof choice!=='string'||choice.length>500)throw Error('Enter up to 500 characters.')}
 else {if(!votingOpen(fresh))throw Error('Voting is closed. Follow the facilitator.');const b=ballot(t,fresh.phase);if(!b||b.key!==key||!b.options.includes(choice))throw Error('This choice is no longer available. Refresh and choose again.')}
 if(fresh.studio_managed&&!isPreview){await submitStudioVote(fresh,p,key,choice);return}
 const sb=await backend();await rows(sb.from('votes').upsert({session_id:fresh.id,team_id:t.id,player_id:p.id,stage_id:'leave_well',decision:key,choice},{onConflict:'player_id,stage_id,decision'}));
}
export function winner(votes,team,key){const c={};for(const v of votes.filter(v=>v.team_id===team.id&&v.decision===key))c[v.choice]=(c[v.choice]||0)+1;const max=Math.max(0,...Object.values(c)),leaders=Object.keys(c).filter(k=>c[k]===max);return leaders.length===1?leaders[0]:null}
export function applyChoice(team,phase,choice,key,source='table_vote'){
 const t=structuredClone(team),g=t.game_state||{};delete g.ballot_pending;t.game_state=g;const applied={...(g.applied_decisions||{})};
 if(applied[key])return t;
 if(!allowedChoices(t,phase).includes(choice))throw Error('The selected choice is unavailable or unaffordable.');
 g.last_decision={key,choice,source,at:new Date().toISOString()};applied[key]=g.last_decision;g.applied_decisions=applied;
 if(phase==='invest'){Object.assign(t,spendCapability(t,choice));t.locked_capability=choice;t.status='capability_locked'}
 if(phase==='design'){t.investments=[...(t.investments||[]),{sequence:(t.investments||[]).length+1,capabilityId:t.locked_capability,commitmentId:choice,strengthened:false}];t.locked_commitment=choice;t.status='design_locked'}
 if(phase==='adapt'){if(choice==='strengthen'){if(!canStrengthen(t))throw Error('Strengthen requires 1 Capital and 1 Change');t.capital-=1;t.change_budget-=1;t.investments.at(-1).strengthened=true;t.status='ready'}else{t.status='extend';t.locked_capability=null}}
 if(phase==='event')g.prediction=choice;
 if(phase==='respond'){g.baseline=evaluateTable(t,'handoff_changed','use');g.evaluation=evaluateTable(t,'handoff_changed',choice);g.responseId=choice;g.responseCost=spendResponse(t,choice);g.resourceCost={capital:t.capital-g.responseCost.capital,change:t.change_budget-g.responseCost.change_budget};Object.assign(t,g.responseCost);t.status='response_locked'}
 t.game_state=g;return t;
}
function chooseRandom(options){const n=crypto.getRandomValues(new Uint32Array(1))[0];return options[n%options.length]}
export async function advanceRoom(session,{force=false,random=chooseRandom}={}){
 const s=await load(session.code);if(activeReflection(s))throw Error('Return from the reflection screen before continuing.');if(s.phase!==session.phase||Number(s.xplayer_revision||0)!==Number(session.xplayer_revision||0))throw Error('This host view is out of date. Wait for the room to refresh.');
 const d=await all(s),p=s.phase;
 if(!DECISION_PHASES.includes(p))return move(s,1);
 // Prediction is an opinion poll: preserve every response, never resolve a winner or pause a table.
 if(p==='event'){
  if(s.studio_managed&&s.studio_control?.timer?.status!=='closed')return advanceRoom(await controlRoom(s,'close'),{force,random});
  const changes=d.teams.filter(t=>t.status!=='inactive'&&t.game_state?.participation!=='withdrawn').map(t=>{const poll=tally(t,p,d.players,d.votes),counts=poll.counts,leaders=poll.leaders,label=!poll.cast?'NOT RECORDED':leaders.length>1?'SPLIT · '+Object.entries(counts).map(([k,v])=>k+' '+v).join(' · '):leaders[0];return {...t,game_state:{...t.game_state,prediction:label,prediction_counts:counts,prediction_votes:poll.cast,prediction_window:s.studio_control?.timer,runoff:null}}});
  return transition(s,changes,'impact');
 }
 const active=d.teams.filter(t=>t.game_state?.participation!=='withdrawn'&&(baseDecision(t,p)||t.game_state?.ballot_pending?.phase===p)&&(d.players.some(x=>x.team_id===t.id)||(t.investments||[]).length));
 if(!active.length)return transition(s,[],nextDecisionPhase(p,d.teams));
 const ts=active.map(t=>{const pending=t.game_state?.ballot_pending;if(pending?.phase===p)return {team:t,ballot:{baseKey:pending.key},people:[],ready:true,cast:pending.cast,counts:pending.counts,leaders:[pending.choice],pending:true};return tally(t,p,d.players,d.votes)});
 if(!force&&ts.some(t=>!t.ready))throw Error('Waiting for all joined players at active tables to vote.');
 // Closing is serialized with server ballots. No late vote can race a committed snapshot.
 if(s.studio_managed&&s.studio_control?.timer?.status!=='closed')return advanceRoom(await controlRoom(s,'close'),{force,random});
 const firstTies=ts.filter(t=>t.leaders.length>1&&!t.ballot.runoff&&!t.pending&&t.people.some(p=>p.seat_active!==false));
 if(firstTies.length){const changes=ts.map(r=>{if(r.pending||r.ballot.runoff)return r.team;const g={...r.team.game_state};if(r.leaders.length>1&&r.people.some(p=>p.seat_active!==false))g.runoff={phase:p,baseKey:r.ballot.baseKey,key:r.ballot.baseKey+'__runoff',options:r.leaders,status:'open',firstCounts:r.counts,firstCast:r.cast,eligible:r.people.length,firstWindow:s.studio_control?.timer};else {const pick=selectResult(r,p,random);g.ballot_pending={phase:p,key:r.ballot.baseKey,choice:pick.choice,source:pick.source,cast:r.cast,counts:r.counts,eligible:r.people.length,window:s.studio_control?.timer}}return {...r.team,game_state:g}});return transition(s,changes,p)}
 const changes=ts.map(r=>{
  const pick=r.pending?r.team.game_state.ballot_pending:selectResult(r,p,random);
  if(!pick.choice){return {...r.team,status:'ready',game_state:{...r.team.game_state,second_round_attempted:p==='invest',last_decision:{key:r.ballot.baseKey,source:'default_no_legal_action',choice:'KEEP_EXISTING_DESIGN'}}}}
  let t=applyChoice(r.team,p,pick.choice,r.ballot.baseKey,pick.source||'table_vote');if(!['table_vote','runoff_vote'].includes(pick.source))t.game_state.assisted=true;const decision=t.game_state.applied_decisions[r.ballot.baseKey];Object.assign(decision,{counts:r.pending?pick.counts:r.counts,cast:r.pending?pick.cast:r.cast,eligible:r.pending?pick.eligible:r.people.length,window:r.pending?pick.window:s.studio_control?.timer,abstentions:Math.max(0,(r.pending?pick.eligible:r.people.length)-(r.pending?pick.cast:r.cast))});
  if(r.ballot.runoff){t.game_state.runoff={...t.game_state.runoff,status:'resolved',choice:pick.choice,source:pick.source};decision.firstWindow=t.game_state.runoff.firstWindow;decision.firstCounts=t.game_state.runoff.firstCounts||{};decision.runoffCounts=r.counts}
  return t;
 });
 return transition(s,changes,nextDecisionPhase(p,d.teams.map(t=>changes.find(x=>x.id===t.id)||t)));
}
function selectResult(r,p,random){
 if(r.cast){return {choice:r.leaders.length===1?r.leaders[0]:random(r.leaders),source:r.leaders.length>1?(r.people.some(p=>p.seat_active!==false)?'random_after_runoff_tie':'random_no_active_voters'):r.ballot.runoff?'runoff_vote':'table_vote'}}
 if(r.ballot.runoff){return {choice:random(r.ballot.options),source:'random_no_runoff_votes'}}
 const options=allowedChoices(r.team,p);if(p==='respond')return {choice:'use',source:'default_use_no_votes'};if(p==='adapt'&&options.includes('strengthen'))return {choice:'strengthen',source:'default_strengthen_no_votes'};
 return {choice:options.length?random(options):null,source:'default_random_no_votes'};
}
export function evaluate(team,eventId='handoff_changed',response='use'){return evaluateTable(team,eventId,response)}

// Attach opaque media tickets without rewinding the room or repeating paid decisions.
export async function attachReveals(session,prepared){
 const fresh=await load(session.code);if(!['result','finalReveal','principles'].includes(fresh.phase))throw Error('Reveal tickets can only be attached after results.');
 const d=await all(fresh),changes=[];
 for(const item of prepared){if(!/^[a-f0-9]{48}$/.test(item.ticket||''))throw Error('Invalid reveal ticket');const t=d.teams.find(t=>t.id===item.teamId);if(!t)throw Error('Reveal table does not belong to this room');const u=new URL(item.api);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error('Reveal API must use HTTPS');changes.push({...t,game_state:{...t.game_state,reveal:{ticket:item.ticket,api:u.href.replace(/\/$/,''),durationSeconds:10}}})}
 return transition(fresh,changes,fresh.phase);
}
