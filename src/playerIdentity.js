// XPLAYER BASELINE 1.0 - LOCKED DEVICE IDENTITY CONTRACT
// The room QR identifies only the room. A URL player parameter is never authority.
const PREFIX='abd-xplayer-player:';
const seat=()=>{if(typeof location==='undefined')return '';const q=new URLSearchParams(location.search);return q.get('preview')==='1'?':seat:'+(q.get('seat')||'manual'):''};
const key=room=>PREFIX+String(room||'').trim().toUpperCase()+seat();
export function bindPlayer(room,playerId){
  if(!room||!playerId) throw new Error('room and playerId are required');
  localStorage.setItem(key(room),String(playerId));
}
export function getBoundPlayer(room){return localStorage.getItem(key(room))||null}
export function clearBoundPlayer(room){localStorage.removeItem(key(room))}
export function resolveBoundPlayer(room,players,sessionId){
  const id=getBoundPlayer(room);
  if(!id) return null;
  return (players||[]).find(p=>p.id===id&&p.session_id===sessionId)||null;
}
export function cleanJoinUrl(){
  const u=new URL(location.href);
  // Remove historical player identity from copied/bookmarked links.
  u.searchParams.delete('player');
  if(globalThis.__arthurLocation){globalThis.__arthurLocation=u;return}
  history.replaceState(null,'',u);
}
