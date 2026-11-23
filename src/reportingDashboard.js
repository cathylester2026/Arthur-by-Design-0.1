import {buildSessionReport,csv,safeReport} from './sessionReport.js';
import {CAPABILITIES} from './leaveWellExperience.js';
import {CHOICES} from './recoverWell/recoveryContent.js';
import {sessionReport,hostSecret} from './studioClient.js';
import {load} from './parityEngine.js';
import './reportingDashboard.css';

const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const labels={
 leave:i=>{const c=CAPABILITIES[i.capabilityId];return [c?.title||i.capabilityId,c?.options?.[i.commitmentId]?.[0]||i.commitmentId].filter(Boolean).join(' / ')},
 recover:i=>CHOICES[i.designId]?.title||i.designId
};
const normalizedCodes=text=>[...new Set(String(text||'').toUpperCase().split(/[\s,;]+/).map(s=>s.trim()).filter(s=>/^[A-Z0-9_-]{2,20}$/.test(s)))];
const dates=(a,b,v)=>{if(!v)return !a&&!b;const day=String(v).slice(0,10);return (!a||day>=a)&&(!b||day<=b)};
function knownHostCodes(){
 const codes=[];
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(k.startsWith('abd-studio-host:')&&localStorage.getItem(k))codes.push(k.slice('abd-studio-host:'.length))}}catch{}
 return normalizedCodes(codes.join(','));
}
function classifyReportError(error,stage){
 const code=String(error?.code||''),raw=String(error?.message||error||'Unknown error').slice(0,500);
 if(/PGRST202|42883|Could not find the function|does not exist|schema cache/i.test(code+' '+raw))
  return {type:'Reporting backend unavailable',reason:'The required Supabase reporting/session RPC is not installed or not visible. Ask the Supabase administrator to verify the reporting migration and function grants.'};
 if(/401|403|42501|permission|unauthori|invalid.*token|facilitator/i.test(code+' '+raw))
  return {type:'Authorization rejected',reason:'This session requires its valid facilitator key. Restore the key using the original host screen or approved backup; a session code alone is not sufficient.'};
 if(/timed out|fetch|network|offline/i.test(raw))
  return {type:'Connection error',reason:'The reporting service could not be reached. Check the network and try again.'};
 if(stage==='key')return {type:'Facilitator key not available',reason:'This browser has no valid saved facilitator key for the session. A session code is not enough to access private reporting.'};
 if(stage==='session')return {type:'Session lookup failed',reason:'The saved code could not be resolved by the authorized session endpoint. This may be a legacy room or a backend configuration issue.'};
 return {type:'Report request failed',reason:'The session was found, but its protected report could not be retrieved. The facilitator key or reporting backend may need attention.'};
}
function download(filename,content,mime){
 const url=URL.createObjectURL(new Blob([content],{type:mime})),a=document.createElement('a');
 a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function table(rows,max=40){
 if(!rows.length)return '<p class="report-empty">No records are available for this selection.</p>';
 const keys=[...new Set(rows.slice(0,max).flatMap(Object.keys))];
 return '<div class="reporting-scroll"><table><thead><tr>'+keys.map(x=>'<th>'+escape(x.replaceAll('_',' '))+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(0,max).map(r=>'<tr>'+keys.map(k=>'<td>'+escape(typeof r[k]==='object'?JSON.stringify(r[k]):r[k])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p class="reporting-count">Showing '+Math.min(max,rows.length)+' of '+rows.length+' rows. Export for the complete dataset.</p>';
}
function collect(records){
 const out={sessions:[],players:[],runs:[],tables:[],combinations:[],reflections:[],votes:[]};
 for(const {session,raw,report} of records){
  const code=session.code,created_at=session.created_at||raw.session?.created_at||'';
  out.sessions.push({session_code:code,session_id:session.id,created_at,players:report.summary.players,tables:report.summary.tableCount,independent_runs:report.runs.length,reflections:report.reflections.length});
  for(const k of ['players','runs','tables','combinations','reflections'])for(const row of report[k])out[k].push({session_code:code,session_created_at:created_at,...row});
  for(const vote of (Array.isArray(raw.votes)?raw.votes:[]))out.votes.push({session_code:code,session_created_at:created_at,...safeReport(vote)});
 }
 return out;
}
export function start(root){
 const initial=knownHostCodes(),query=new URLSearchParams(location.search),requested=normalizedCodes(query.get('room')||'');
 const available=[...new Set([...requested,...initial])],state={loaded:[],failures:[],active:'players',filters:{from:'',to:''}};
 root.innerHTML='<div class="reporting-dashboard"><header><a href="./">ARTHUR: BY DESIGN</a><span>PRIVATE REPORTING</span></header><main><small>FACILITATOR DATA · NOT FOR PROJECTION</small><h1>Reporting & exports</h1><p>Export saved players, choices, outcomes and feedback from sessions you are authorized to manage.</p><section class="reporting-panel"><label for="report-codes">Session codes <small>Comma-separated. Authorized session codes on this browser are prefilled.</small></label><textarea id="report-codes" rows="2"></textarea><div class="reporting-filters"><label for="report-from">Session started on or after<input id="report-from" type="date"></label><label for="report-to">Session started on or before<input id="report-to" type="date"></label></div><div class="reporting-buttons"><button id="report-load">Load authorized sessions</button><button id="report-clear" class="secondary">Clear loaded data</button></div><p role="status" id="report-message">Enter one or more session codes, then load your reports.</p></section><div id="report-results"></div><p class="reporting-footnote">Privacy: Downloads can include participant emails and responses. Keep them in an approved location. Date filters use the session creation date; only authorized sessions entered or recorded in this browser can be loaded. Browser-only unsynced activity is not available from Supabase.</p></main></div>';
 const $=id=>root.querySelector('#'+id),message=$('report-message'),result=$('report-results');
 $('report-codes').value=available.join(', ');
 if(available.length)message.textContent=available.length+' session code(s) listed. A stored key does not guarantee the session remains available in Supabase.';
 const current=()=>{
  const a=$('report-from').value,b=$('report-to').value;
  return state.loaded.filter(x=>dates(a,b,x.session.created_at||x.raw.session?.created_at||''));
 };
 function failureDetail(){
 const examples=state.failures.slice(0,8);
 const counts=new Map();for(const f of state.failures)counts.set(f.type,(counts.get(f.type)||0)+1);
 return '<p><b>Failure categories:</b> '+[...counts].map(([name,n])=>escape(name)+' ('+n+')').join(' · ')+'</p><details open><summary>View per-session diagnostics (first 8)</summary><div class="reporting-scroll"><table><thead><tr><th>Session</th><th>Stage</th><th>Issue</th><th>Action</th></tr></thead><tbody>'+
 examples.map(x=>'<tr><td>'+escape(x.session)+'</td><td>'+escape(x.stage)+'</td><td>'+escape(x.type)+'</td><td>'+escape(x.reason)+'</td></tr>').join('')+
 '</tbody></table></div></details><p class="reporting-warning">Do not share facilitator keys or participant records when requesting support. The reporting dashboard does not attempt to bypass Supabase authorization.</p>';
}
function render(){
  const records=current(),data=collect(records),total=state.loaded.length;
  if(!total){result.innerHTML=state.failures.length?'<section class="reporting-panel"><h2>No sessions could be loaded</h2><p>These session codes are saved in this browser, but that does not prove they are accessible to the current reporting backend. No participant data has been exported.</p>'+failureDetail()+'</section>':'';return}
  const groups=[['players','Players & decisions'],['runs','Independent runs'],['reflections','Feedback'],['votes','Individual votes'],['tables','Table outcomes'],['combinations','Combinations'],['sessions','Sessions']];
  const allowed=new Set(groups.map(g=>g[0]));if(!allowed.has(state.active))state.active='players';
  const body=data[state.active],errorMarkup=state.failures.length?'<div class="reporting-warning"><strong>Some sessions could not be loaded.</strong>'+failureDetail()+'</div>':'';
  result.innerHTML='<section class="reporting-panel"><h2>Loaded session reporting</h2><div class="reporting-metrics"><div><strong>'+records.length+'</strong><small>sessions in date filter</small></div><div><strong>'+data.players.length+'</strong><small>players</small></div><div><strong>'+data.runs.length+'</strong><small>independent runs</small></div><div><strong>'+data.reflections.length+'</strong><small>feedback records</small></div></div><p>'+total+' authorized session(s) loaded. Shared table choices are labeled as table outcomes, not individual votes.</p>'+errorMarkup+'<div class="reporting-tabs" role="group" aria-label="Report dataset">'+groups.map(([key,title])=>'<button data-report-tab="'+key+'" class="'+(state.active===key?'active':'')+'">'+escape(title)+' ('+data[key].length+')</button>').join('')+'</div><div class="reporting-buttons"><button data-export="current">Download '+escape(state.active)+' CSV</button><button data-export="all">Download all datasets JSON</button></div><div class="reporting-data">'+table(body)+'</div></section>';
  result.querySelectorAll('[data-report-tab]').forEach(btn=>btn.onclick=()=>{state.active=btn.dataset.reportTab;render()});
  result.querySelector('[data-export="current"]').onclick=()=>download('Arthur-'+state.active+'-filtered.csv',csv(body),'text/csv;charset=utf-8');
  result.querySelector('[data-export="all"]').onclick=()=>download('Arthur-authorized-sessions-filtered.json',JSON.stringify({exported_at:new Date().toISOString(),date_filter:{from:$('report-from').value,to:$('report-to').value},...data},null,2),'application/json');
 }
 async function fetchReports(){
  const codes=normalizedCodes($('report-codes').value);
  if(!codes.length){message.textContent='Enter at least one valid session code.';return}
  if(codes.length>50){message.textContent='Load up to 50 authorized session codes at a time.';return}
  const from=$('report-from').value,to=$('report-to').value;
  if(from&&to&&from>to){message.textContent='The start date must not be later than the end date.';return}
  $('report-load').disabled=true;state.loaded=[];state.failures=[];result.innerHTML='';
  try{
   for(const code of codes){
    message.textContent='Checking authorization and loading '+code+'…';
    try{
     if(!hostSecret(code))throw Error('facilitator key not found in this browser');
     let stage='session';
     try{
      const session=await load(code);
      if(!session?.id||session.code?.toUpperCase()!==code)throw Error('Session lookup did not match the requested code');
      stage='report';
      const raw=await sessionReport(session);
      const report=buildSessionReport(raw,labels);
      state.loaded.push({session,raw:report.data,report});
     }catch(error){const classification=classifyReportError(error,stage);state.failures.push({session:code,stage,type:classification.type,reason:classification.reason})}
    }catch(error){const classification=classifyReportError(error,'key');state.failures.push({session:code,stage:'key',type:classification.type,reason:classification.reason})}
   }
   message.textContent=state.loaded.length+' authorized session(s) loaded; '+state.failures.length+' could not be loaded. Open diagnostics below for the reason.';
   render();
  }finally{$('report-load').disabled=false}
 }
 $('report-load').onclick=fetchReports;
 $('report-clear').onclick=()=>{state.loaded=[];state.failures=[];result.innerHTML='';message.textContent='Loaded reporting data cleared from this page.'};
 $('report-from').onchange=render;$('report-to').onchange=render;
}
