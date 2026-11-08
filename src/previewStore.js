// Isolated test backend. No Supabase requests; records stay in this browser.
const KEY='arthur-xplayer-preview-v1';
const empty=()=>({sessions:[],teams:[],players:[],votes:[]});
const copy=x=>structuredClone(x);
const read=()=>JSON.parse(localStorage.getItem(KEY)||'null')||empty();
const listeners=new Set();
const channel=globalThis.__arthurPreviewBus||(()=>{try{return typeof window!=='undefined'&&typeof BroadcastChannel==='function'?new BroadcastChannel(KEY):null}catch{return null}})();
function emit(){for(const f of listeners)queueMicrotask(f)}
channel?.addEventListener('message',emit);
globalThis.addEventListener?.('storage',e=>{if(e.key===KEY)emit()});
function save(db){localStorage.setItem(KEY,JSON.stringify(db));channel?.postMessage('changed');emit()}
export function resetPreview(){save(empty())}
export function previewSnapshot(){return copy(read())}
export function subscribePreview(fn){listeners.add(fn);return {unsubscribe:()=>listeners.delete(fn)}}
export function createPreviewRoom(){const db=read(),room={id:crypto.randomUUID(),code:crypto.randomUUID().slice(0,6).toUpperCase(),phase:'meet',screen:'parity',status:'active',stage_index:0,reveal_step:0,xplayer_revision:0};db.sessions.push(room);save(db);return copy(room)}
export function query(table){let operation='select',value,filters=[],single=false;const q={select(){return q},eq(k,v){filters.push([k,v]);return q},insert(v){operation='insert';value=v;return q},update(v){operation='update';value=v;return q},upsert(v){operation='upsert';value=v;return q},single(){single=true;return q},maybeSingle(){single=true;return q},then(resolve,reject){try{const db=read(),match=r=>filters.every(([k,v])=>r[k]===v);let rows;
if(operation==='select')rows=db[table].filter(match);
else if(operation==='insert'){rows=(Array.isArray(value)?value:[value]).map(v=>({...copy(v),id:v.id||crypto.randomUUID()}));db[table].push(...rows);save(db)}
else if(operation==='update'){rows=db[table].filter(match);rows.forEach(r=>Object.assign(r,copy(value)));save(db)}
else {const old=db[table].find(r=>r.player_id===value.player_id&&r.stage_id===value.stage_id&&r.decision===value.decision);if(old)Object.assign(old,copy(value));else db[table].push({...copy(value),id:crypto.randomUUID()});rows=[];save(db)}
return Promise.resolve({data:copy(single?rows[0]||null:rows),error:null}).then(resolve,reject)}catch(error){return Promise.resolve({data:null,error}).then(resolve,reject)}}};return q}
export function transitionPreview(session,changes,next){const db=read(),s=db.sessions.find(s=>s.id===session.id);if(!s||s.phase!==session.phase||Number(s.xplayer_revision||0)!==Number(session.xplayer_revision||0))throw Error('The room changed in another window. Refresh and try again.');
for(const change of changes){const t=db.teams.find(t=>t.id===change.id&&t.session_id===s.id);if(!t)throw Error('Table does not belong to this room');if(change.capital<0||change.change_budget<0)throw Error('Budget cannot be negative')}
for(const change of changes)Object.assign(db.teams.find(t=>t.id===change.id),copy(change));s.phase=next;s.reveal_step=0;s.xplayer_revision=Number(s.xplayer_revision||0)+1;save(db);return copy(s)}
