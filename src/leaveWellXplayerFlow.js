// One pure flow contract, shared by phones, facilitator and regression tests.
import { CAPABILITIES } from './leaveWellExperience.js';
import { canAfford, canStrengthen, responseEligibility } from './xplayerRules.js';
export const DECISION_PHASES = ['invest','design','adapt','event','impact','respond'];
export function baseDecision(team, phase) {
  if (team.status === 'inactive') return null;
  const n = (team.investments || []).length + 1;
  if (phase === 'invest') return n <= 2 && (n === 1 || team.status === 'extend') ? `capability${n}` : null;
  if (phase === 'design') return n <= 2 && team.status === 'capability_locked' ? `design${n}` : null;
  return {adapt:'strategy',event:'prediction',impact:'impact_ack',respond:'response'}[phase] || null;
}
export function canExtend(team) {
  return (team.investments || []).length < 2 && Object.keys(CAPABILITIES).some(id => !(team.investments || []).some(i => i.capabilityId === id) && canAfford(team,id));
}
export function allowedChoices(team, phase) {
  if (!baseDecision(team,phase)) return [];
  if (phase === 'invest') return Object.keys(CAPABILITIES).filter(id => !(team.investments || []).some(i => i.capabilityId === id) && canAfford(team,id));
  if (phase === 'design') return Object.keys(CAPABILITIES[team.locked_capability]?.options || {});
  if (phase === 'adapt') return [canStrengthen(team) && 'strengthen', canExtend(team) && 'extend'].filter(Boolean);
  if (phase === 'event') return ['YES','NOT SURE','NO'];
  if (phase === 'impact') return ['ready'];
  if (phase === 'respond') return Object.entries(responseEligibility(team)).filter(([,v])=>v.ok).map(([k])=>k);
  return [];
}
export function openRunoff(team, phase) {
  const r=team.game_state?.runoff;
  return r?.phase===phase && r.status==='open' ? r : null;
}
export function ballot(team, phase) {
  const key=baseDecision(team,phase), r=openRunoff(team,phase);
  return key ? {key:r?.key || key,baseKey:key,options:r?.options || allowedChoices(team,phase),runoff:!!r} : null;
}
export function tally(team, phase, players, votes) {
  const b=ballot(team,phase), people=players.filter(p=>p.team_id===team.id), ids=new Set(people.map(p=>p.id)), seen=new Map();
  for(const v of votes) if(b && v.team_id===team.id && ids.has(v.player_id) && v.decision===b.key && b.options.includes(v.choice)) seen.set(v.player_id,v);
  const counts={}; for(const v of seen.values()) counts[v.choice]=(counts[v.choice]||0)+1;
  const max=Math.max(0,...Object.values(counts)), leaders=max?Object.keys(counts).filter(k=>counts[k]===max):[];
  return {team,ballot:b,people,counts,leaders,cast:seen.size,ready:!!b && people.length>0 && seen.size===people.length};
}
export function nextDecisionPhase(phase,teams) {
  return {invest:'activation',design:'designReveal',adapt:teams.some(t=>t.status==='extend')?'invest':'event',event:'impact',impact:'respond',respond:'result'}[phase] || null;
}
export function choiceLabel(team,phase,id) {
  return phase==='invest'?CAPABILITIES[id]?.title || id:phase==='design'?CAPABILITIES[team.locked_capability]?.options?.[id]?.[0] || id:phase==='adapt'?(id==='strengthen'?'STRENGTHEN':'EXTEND'):id;
}
