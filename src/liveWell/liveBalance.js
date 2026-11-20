// Authored, reproducible community conditions for balancing and facilitated reveals.
// Each fact describes an external condition; selecting a design never changes these facts.
// A balanced game shows distinct credible outcomes without granting fictional capacity.
import {SCENARIOS,eventFacts} from './liveResolver.js';
export const BALANCE_VERSION='live-balance-v1';
const authored=[
 {id:'S1-detour-confirmed',difficulty:'routine',scenarioId:'S1',title:'An inspected accessible detour',description:'A longer alternate route has been inspected. Current mapping and visible signs are available.',facts:{alternativeRouteVerified:true,currentRouteData:true}},
 {id:'S1-offline-detour',difficulty:'routine',scenarioId:'S1',title:'Accessible route, connectivity gap',description:'An inspected detour exists, but current mobile guidance is unavailable. Offline directions were prepared.',facts:{alternativeRouteVerified:true,currentRouteData:false,offlineGuideUsable:true}},
 {id:'S1-ride-accepted',difficulty:'routine',scenarioId:'S1',title:'A real accessible ride is available',description:'The alternative walking route is unusable. An accessible vehicle accepts Arthur’s pickup at a usable location.',facts:{alternativeRouteExists:false,alternativeRouteAccessible:false,accessibleTransportAvailable:true,transportRequestAccepted:true,assistanceAccepted:true}},
 {id:'S1-all-routes-blocked',difficulty:'stress',scenarioId:'S1',title:'No safe route or vehicle',description:'The detour is inaccessible and no suitable vehicle is available. An ordinary decision to defer remains possible.',facts:{alternativeRouteExists:false,alternativeRouteAccessible:false,accessibleTransportAvailable:false,transportRequestAccepted:false,assistanceAccepted:false,adaptedDetourVerified:false,coordinatedTransportAccepted:false}},
 {id:'S2-pod-accepted',difficulty:'routine',scenarioId:'S2',title:'Qualified community pod consultation',description:'The pod is reachable and operating; a qualified clinician actually accepts Arthur’s assessment.',facts:{podClinicianAccepted:true,assessmentAccepted:true,assessmentQualified:true,assessmentWithinWindow:true,participationSupportAccepted:true,participationStaffAvailable:true,participationBackupReady:true}},
 {id:'S2-network-accepted',difficulty:'routine',scenarioId:'S2',title:'Qualified local network accepts',description:'A participating service accepts referral, capacity and qualified assessment. Coordination is available.',facts:{referralAccepted:true,referralCapacity:true,communityConciergeAccepted:true,remoteAdviceAccepted:true,coordinatedAssessmentConfirmed:true,participationSupportAccepted:true,participationStaffAvailable:true,participationBackupReady:true}},
 {id:'S2-mobile-accepted',difficulty:'routine',scenarioId:'S2',title:'Appropriate mobile team accepts',description:'An appropriate staffed mobile service has confirmed capacity and a qualified timely assessment.',facts:{mobileServiceAccepted:true,mobileServiceCapacity:true,assessmentAccepted:true,assessmentQualified:true,assessmentWithinWindow:true}},
 {id:'S2-participation-not-advised',difficulty:'challenge',scenarioId:'S2',title:'Care succeeds, outing does not',description:'Qualified assessment is accepted, but continuing to the gathering is not appropriate today.',facts:{podClinicianAccepted:true,referralAccepted:true,referralCapacity:true,communityReturnPossible:false,agreedPlanForReturningHome:true}},
 {id:'S2-no-qualified-response',difficulty:'stress',scenarioId:'S2',title:'Qualified advice not established',description:'Rest is available but no qualified accepted assessment route exists within the scenario window.',facts:{assessmentAccepted:false,podClinicianAccepted:false,referralAccepted:false,referralCapacity:false,mobileServiceAccepted:false,mobileServiceCapacity:false,remoteAdviceAccepted:false,coordinatedAssessmentConfirmed:false}},
 {id:'S3-event-confirmed',difficulty:'routine',scenarioId:'S3',title:'Updated event, accessible venue',description:'The event organizer confirms the new staffed venue; the new location and accessible travel are known.',facts:{updatedEventKnown:true,officialUpdateVerified:true,eventOrganizerConfirmed:true,eventParticipationSupportAccepted:true,eventParticipationStaffAvailable:true,eventParticipationBackupReady:true}},
 {id:'S3-hub-confirmed',difficulty:'routine',scenarioId:'S3',title:'Community hub accepts relocation',description:'A properly staffed accessible community hub confirms it can host the gathering; transport is usable.',facts:{communityHubConfirmed:true,eventOrganizerConfirmed:false}},
 {id:'S3-remote-participation',difficulty:'routine',scenarioId:'S3',title:'Arthur accepts an accessible remote option',description:'Travel to the new site is not usable, but the organizer offers an accessible remote option Arthur wants.',facts:{alternateVenueAccessible:false,routeToNewVenueAccessible:false,usableTravelAvailable:false,remoteParticipationAccepted:true}},
 {id:'S3-concierge-confirmed',difficulty:'routine',scenarioId:'S3',title:'An accountable community connector',description:'A community concierge accepts responsibility for the relocation and a viable venue and trip are established.',facts:{conciergeAccepted:true,conciergeAvailable:true,coordinatedRelocationAccepted:true}},
 {id:'S3-no-venue-confirmed',difficulty:'stress',scenarioId:'S3',title:'No confirmed gathering location',description:'The new facility has not accepted the activity. Route guidance or coordination cannot fabricate the venue.',facts:{alternateVenueConfirmed:false,communityHubConfirmed:false,eventOrganizerConfirmed:false,conciergeAccepted:false,remoteParticipationAccepted:false,adaptedParticipationAccepted:false,coordinatedRelocationAccepted:false}}
];
export const BALANCE_PROFILES=Object.freeze(authored.map(v=>Object.freeze({...v,facts:Object.freeze({...v.facts})})));
export const PLAY_PROFILES=Object.freeze(BALANCE_PROFILES.filter(p=>p.difficulty!=='stress'));
export const STRESS_PROFILES=Object.freeze(BALANCE_PROFILES.filter(p=>p.difficulty==='stress'));
export function balanceProfile(id){
 const profile=BALANCE_PROFILES.find(v=>v.id===id);
 if(!profile)throw Error('Unknown Live Well balance profile.');
 return {...profile,facts:eventFacts(profile.scenarioId,profile.facts)};
}
export function scenarioProfiles(scenarioId){
 if(!SCENARIOS[scenarioId])throw Error('Unknown Live Well disruption.');
 return BALANCE_PROFILES.filter(p=>p.scenarioId===scenarioId);
}

/** Choose a reproducible player scenario independently of purchases or desired outcomes.
 * The facilitator may explicitly select a profile instead. Stress-only cases are excluded. */
export function selectPlayProfile(scenarioId,seed){
 if(!SCENARIOS[scenarioId])throw Error('Unknown Live Well disruption.');
 if((typeof seed!=='string'&&typeof seed!=='number')||String(seed).length>200||!String(seed).trim())throw Error('Provide a stable round seed.');
 const candidates=PLAY_PROFILES.filter(p=>p.scenarioId===scenarioId);
 const hash=Array.from(String(seed)).reduce((acc,ch)=>Math.imul(acc^ch.charCodeAt(0),16777619)>>>0,2166136261);
 return balanceProfile(candidates[hash%candidates.length].id);
}
