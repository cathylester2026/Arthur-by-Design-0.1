import {backend,isPreview} from './xplayerBackend.js';
import {previewAdmit,previewControl,previewSoloEvent,previewInsights} from './studioPreview.js';
const hostKey=code=>'abd-studio-host:'+code;
const secretKey=id=>'abd-studio-participant:'+id;
export function saveHostSecret(code,secret){localStorage.setItem(hostKey(code),secret)}
export function hostSecret(code){return localStorage.getItem(hostKey(code))||''}
export function participantSecret(id){return localStorage.getItem(secretKey(id))||''}
export function hasHost(session){return isPreview||!!hostSecret(session.code)}
async function rpc(name,args){const sb=await backend(),r=await sb.rpc(name,args);if(r.error)throw r.error;return r.data}
export async function admit(session,mode,props={}){
 const k='abd-studio-device:'+session.code+':'+mode+(isPreview?':'+(props.alias||'manual'):'');let token=localStorage.getItem(k);if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem(k,token)}
 const params={...props,mode,token};const result=isPreview?previewAdmit(session,params):await rpc('abd_admit_studio',{p_code:session.code,p_mode:mode,p_table:props.table||null,p_token:token,p_email:props.email||null,p_alias:props.alias||null,p_role:props.role||'Other',p_consent:!!props.consent});
 localStorage.setItem(secretKey(result.participant.id),token);return result;
}
export async function controlRoom(session,action,extra={}){if(isPreview)return previewControl(session,action,extra);return rpc('abd_control_studio',{p_session:session.id,p_revision:Number(session.xplayer_revision||0),p_host_token:hostSecret(session.code),p_action:action,p_extra:extra})}
export async function submitStudioVote(session,player,key,choice){return rpc('abd_cast_studio_vote',{p_session:session.id,p_player:player.id,p_token:participantSecret(player.id),p_key:key,p_choice:choice})}
export async function trackSoloEvent(session,participant,event){if(isPreview)return previewSoloEvent(session,participant,event);return rpc('abd_record_solo_event',{p_session:session.id,p_participant:participant.id,p_token:participantSecret(participant.id),p_event:event})}
export async function insights(session){if(isPreview)return previewInsights(session);return rpc('abd_studio_insights',{p_session:session.id,p_host_token:hostSecret(session.code)})}
export async function managedRoomData(session){return rpc('abd_studio_room_data',{p_session:session.id})}
export function navigateStudio(params){const u=new URL(location.href);u.search=new URLSearchParams({...params,...(isPreview?{preview:'1'}:{})}).toString();if(isPreview&&typeof window!=='undefined'&&window.frameElement&&parent.__arthurFrameDocument){window.frameElement.srcdoc=parent.__arthurFrameDocument(u.href)}else location.href=u.href}
