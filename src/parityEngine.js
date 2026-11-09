import {isOnboarding,nextOnboarding,prevOnboarding} from './onboardingRuntime.js';
import {FLOW} from './leaveWellExperience.js';
import {spendCapability,canStrengthen,spendResponse,evaluateTable} from './xplayerRules.js';
import {DECISION_PHASES,baseDecision,allowedChoices,ballot,tally,nextDecisionPhase} from './leaveWellXplayerFlow.js';
import {backend,subscribe,create,transition,isPreview} from './xplayerBackend.js';
export const PLAYER='abd-parity-player',ROOM='abd-parity-room';
export const createRoom=create,sub=subscribe;
async function rows(q){const r=await q;if(r.error)throw r.error;return r.data}
export async function load(code){const sb=await backend();return rows(sb.from('sessions').select('*').eq('code',code.toUpperCase()).single())}
export async function all(s){
 const sb=await backend();
 async function collect(table){if(isPreview)return rows(sb.from(table).select('*').eq('session_id',s.id));const result=[];for(let offset=0;;offset+=500){const page=await rows(sb.from(table).select('*').eq('session_id',s.id).order('id').range(offset,offset+499));result.push(...page);if(page.length<500)return result}}
 const [teams,players,votes]=await Promise.all(['teams','players','votes'].map(collect));return {teams,players,votes};
}
export function phase(s,p){return transition(s,[],p)}
export async function completeJourney(session){const fresh=await load(session.code);if(fresh.phase!==session.phase||Number(fresh.xplayer_revision||0)!==Number(session.xplayer_revision||0))throw Error('This host view is out of date.');if(fresh.phase!=='principles')throw Error('Finish the discussion before completing Leave Well.');const d=await all(fresh);return transition(fresh,d.teams.map(t=>({...t,game_state:{...t.game_state,journey_complete:true}})),'journey')}
export function move(s,n){if(s.phase==='principles')return completeJourney(s);if(s.phase==='finalReveal')return phase(s,'principles');if(n<0)throw Error('Review does not rewind committed decisions.');if(isOnboarding(s.phase))return phase(s,nextOnboarding(s.phase));const i=Math.max(0,FLOW.indexOf(s.phase));return phase(s,FLOW[Math.min(FLOW.length-1,i+1)])}
export async function reveal(s){return s}
export async function join({session,table,email,alias,role,consent}){
 const sb=await backend();let team=await rows(sb.from('teams').select('*').eq('session_id',session.id).eq('table_name',table).maybeSingle());
 if(!team){try{team=await rows(sb.from('teams').insert({session_id:session.id,table_name:table,capital:7,change_budget:6,investments:[],status:'joining',game_state:{}}).select().single())}catch(err){team=await rows(sb.from('teams').select('*').eq('session_id',session.id).eq('table_name',table).maybeSingle());if(!team)throw err}}
 const initials=(email?email.split('@')[0]:alias||'ART').replace(/\W/g,'').slice(0,3).toUpperCase();
 const player=await rows(sb.from('players').insert({session_id:session.id,team_id:team.id,initials,email:email||null,participant_alias:alias||null,role_type:role,imagery_consent:!!consent,imagery_consent_at:consent?new Date().toISOString():null,identity_mode:email?'email':'anonymous',experience_mode:'facilitated'}).select().single());return {player,team};
}
export async function vote({session,team,player,key,choice}){
 const fresh=await load(session.code),d=await all(fresh),t=d.teams.find(t=>t.id===team.id),p=d.players.find(p=>p.id===player.id&&p.team_id===team.id);
 if(!t||!p)throw Error('Player is not registered at this table.');
 if(key==='opening_challenge'){if(fresh.phase!=='opening')throw Error('The opening question has closed.');if(typeof choice!=='string'||!choice.trim()||choice.length>500)throw Error('Enter up to 500 characters.')}
 else if(key.startsWith('reflection:')){if(typeof choice!=='string'||choice.length>500)throw Error('Enter up to 500 characters.')}
 else {const b=ballot(t,fresh.phase);if(!b||b.key!==key||!b.options.includes(choice))throw Error('This choice is no longer available. Refresh and choose again.')}
 const sb=await backend();await rows(sb.from('votes').upsert({session_id:fresh.id,team_id:t.id,player_id:p.id,stage_id:'leave_well',decision:key,choice},{onConflict:'player_id,stage_id,decision'}));
}
export function winner(votes,team,key){const c={};for(const v of votes.filter(v=>v.team_id===team.id&&v.decision===key))c[v.choice]=(c[v.choice]||0)+1;const max=Math.max(0,...Object.values(c)),leaders=Object.keys(c).filter(k=>c[k]===max);return leaders.length===1?leaders[0]:null}
export function applyChoice(team,phase,choice,key,source='table_vote'){
 const t=structuredClone(team),g=t.game_state||{},applied={...(g.applied_decisions||{})};
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
 const s=await load(session.code);if(s.phase!==session.phase||Number(s.xplayer_revision||0)!==Number(session.xplayer_revision||0))throw Error('This host view is out of date. Wait for the room to refresh.');
 const d=await all(s),p=s.phase;
 if(!DECISION_PHASES.includes(p))return move(s,1);
 // Prediction is an opinion poll: preserve every response, never resolve a winner or pause a table.
 if(p==='event'){
  const changes=d.teams.filter(t=>t.status!=='inactive').map(t=>{const poll=tally(t,p,d.players,d.votes),counts=poll.counts,leaders=poll.leaders,label=!poll.cast?'NOT RECORDED':leaders.length>1?'SPLIT · '+Object.entries(counts).map(([k,v])=>k+' '+v).join(' · '):leaders[0];return {...t,game_state:{...t.game_state,prediction:label,prediction_counts:counts,prediction_votes:poll.cast,runoff:null}}});
  return transition(s,changes,'impact');
 }
 const active=d.teams.filter(t=>baseDecision(t,p)&&d.players.some(x=>x.team_id===t.id));
 if(!active.length)throw Error('No active tables are ready for this step.');
 const ts=active.map(t=>tally(t,p,d.players,d.votes));
 if(!force&&ts.some(t=>!t.ready))throw Error('Waiting for all joined players at active tables to vote.');
 // A first tie opens a runoff without spending or committing ANY table.
 const firstTies=ts.filter(t=>t.leaders.length>1&&!t.ballot.runoff);
 if(firstTies.length){const changes=firstTies.map(r=>({...r.team,game_state:{...(r.team.game_state||{}),runoff:{phase:p,baseKey:r.ballot.baseKey,key:r.ballot.baseKey+'__runoff',options:r.leaders,status:'open'}}}));return transition(s,changes,p)}
 const changes=ts.map(r=>{if(!r.cast)return {...r.team,status:'inactive'};const choice=r.leaders.length===1?r.leaders[0]:random(r.leaders),source=r.leaders.length>1?'random_after_runoff_tie':r.ballot.runoff?'runoff_vote':'table_vote';let t=applyChoice(r.team,p,choice,r.ballot.baseKey,source);if(r.ballot.runoff)t.game_state.runoff={...t.game_state.runoff,status:'resolved',choice,source};return t});
 const teams=d.teams.map(t=>changes.find(x=>x.id===t.id)||t);
 return transition(s,changes,nextDecisionPhase(p,teams));
}
export function evaluate(team,eventId='handoff_changed',response='use'){return evaluateTable(team,eventId,response)}

// Attach opaque media tickets without rewinding the room or repeating paid decisions.
export async function attachReveals(session,prepared){
 const fresh=await load(session.code);if(!['result','finalReveal','principles'].includes(fresh.phase))throw Error('Reveal tickets can only be attached after results.');
 const d=await all(fresh),changes=[];
 for(const item of prepared){if(!/^[a-f0-9]{48}$/.test(item.ticket||''))throw Error('Invalid reveal ticket');const t=d.teams.find(t=>t.id===item.teamId);if(!t)throw Error('Reveal table does not belong to this room');const u=new URL(item.api);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error('Reveal API must use HTTPS');changes.push({...t,game_state:{...t.game_state,reveal:{ticket:item.ticket,api:u.href.replace(/\/$/,''),durationSeconds:10}}})}
 return transition(fresh,changes,fresh.phase);
}
