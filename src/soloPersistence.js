// Keeps a running independent game usable if storage becomes full/unavailable.
const memory=new Map();let degraded=false,repair=false;
export function getLocal(key){try{const value=localStorage.getItem(key);if(!degraded||!memory.has(key))return value}catch{degraded=true}return memory.get(key)||null}
export function putLocal(key,value){memory.set(key,value);try{localStorage.setItem(key,value)}catch{degraded=true}}
export function readLocalJSON(key,fallback){const raw=getLocal(key);if(!raw)return fallback;try{return JSON.parse(raw)}catch{putLocal(key+':corrupt-copy',raw);putLocal(key,JSON.stringify(fallback));repair=true;return fallback}}
export const storageStatus=()=>({degraded,repair});
export function permanentInsightError(err){return /invalid insight event|event limit reached|payload too large/i.test(err?.message||'')}
