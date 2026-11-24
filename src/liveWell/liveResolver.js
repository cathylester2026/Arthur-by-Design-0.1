import catalogue from './liveCatalogue.json' with {type:'json'};

export const LIVE_WELL_VERSION='lw3-causal-v0.1';
export const CAPITAL=7, CHANGE=6;
export const CAPABILITIES=catalogue;
export const DESIGNS=Object.freeze(Object.fromEntries(catalogue.flatMap(f=>f.choices.map(c=>[c.id,Object.freeze({...c,familyId:f.id,familyTitle:f.title,cost:f.cost})]))));
export const RESPONSE_COSTS=Object.freeze({use:{capital:0,change:0},adapt:{capital:0,change:1},coordinate:{capital:1,change:1},ordinary:{capital:0,change:0}});
export const SCENARIOS=Object.freeze({
 S1:{id:'S1',name:'The accessible route closes',task:'Reach the community gathering with a usable route and reasonable effort.',required:'Physical access or accepted accessible transportation',facts:{
  plannedRouteClosed:true,alternativeRouteExists:true,alternativeRouteAccessible:true,alternativeRouteVerified:false,routeFitsArthur:true,physicalWayfindingAvailable:true,
  currentRouteData:false,offlineGuideUsable:false,accessibleTransportAvailable:true,transportRequestAccepted:false,pickupAccessible:true,backupTransportAvailable:false,
  safeRestAvailable:true,assistanceAccepted:false,adaptedDetourVerified:false,coordinatedTransportAccepted:false,connectionAvailable:true}},
 S2:{id:'S2',name:'Arthur feels unusually fatigued',task:'Pause safely and get appropriate qualified advice if needed, preserving his choice.',required:'Safe pause and an actually accepted assessment route',facts:{
  safeRestAvailable:true,newConcerningChange:true,approvedActivityEnvelope:true,currentApprovedGoals:true,walkingFeedbackValid:true,ordinaryContactAvailable:true,
  assessmentAccepted:true,assessmentQualified:true,assessmentWithinWindow:true,clinicalContextCurrent:true,
  podAccessible:true,podOperational:true,podClinicianAccepted:false,podEquipmentReady:true,
  referralAccepted:false,referralCapacity:false,mobileServiceAccepted:false,mobileServiceCapacity:false,
  remoteAdviceAccepted:false,remoteParticipationAccepted:false,communityConciergeAccepted:false,communityReturnPossible:true,participationSupportAccepted:false,participationStaffAvailable:true,participationBackupReady:false,
  agreedPlanForReturningHome:false,transportRequestAccepted:false,transportCapacity:false,approvedLocalAdjustmentAvailable:false,coordinatedAssessmentConfirmed:false}},
 S3:{id:'S3',name:'The gathering changes venues',task:'Confirm where the event is and participate in a usable way.',required:'Confirmed viable venue and accessible route or accepted participation alternative',facts:{
  venueChanged:true,updatedEventKnown:false,alternateVenueConfirmed:true,alternateVenueAccessible:true,
  routeToNewVenueAccessible:true,usableTravelAvailable:true,officialUpdateVerified:false,
  alternateVenueStaffed:true,alternateParticipationOffered:true,remoteParticipationAccepted:false,changedTransportAccepted:false,backupConciergeAccepted:false,
  conciergeAvailable:true,conciergeAccepted:false,backupConciergeAvailable:false,
  eventOrganizerConfirmed:false,communityHubActive:true,communityHubConfirmed:false,
  eventParticipationSupportAccepted:false,eventParticipationStaffAvailable:true,eventParticipationBackupReady:false,adaptedParticipationAccepted:false,coordinatedRelocationAccepted:false}}
});
const cloned=x=>JSON.parse(JSON.stringify(x));
const checkObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
function costSum(rows){return rows.reduce((s,i)=>({capital:s.capital+DESIGNS[i.designId].cost.capital,change:s.change+DESIGNS[i.designId].cost.change}),{capital:0,change:0})}
export function validatePortfolio({investments,strategy}){
 if(!Array.isArray(investments)||!investments.length||investments.length>2)throw Error('Choose one or two investments.');
 if(!['strengthen','extend'].includes(strategy))throw Error('Choose Strengthen or Extend.');
 if(investments.length!==(strategy==='strengthen'?1:2))throw Error('Investment count must match strategy.');
 const families=new Set();
 for(const item of investments){
  if(!checkObject(item)||!DESIGNS[item.designId])throw Error('Unknown Live Well design.');
  const family=DESIGNS[item.designId].familyId;
  if(families.has(family))throw Error('Extend must select a different investment family.');
  families.add(family);
  if(item.strengthened!==undefined&&item.strengthened!==(strategy==='strengthen'))throw Error('Strengthened flag disagrees with selected strategy.');
 }
 const spent=costSum(investments);
 if(strategy==='strengthen'){spent.capital++;spent.change++;}
 if(spent.capital>CAPITAL||spent.change>CHANGE)throw Error('Insufficient Capital or Change.');
 return {spent,remaining:{capital:CAPITAL-spent.capital,change:CHANGE-spent.change}};
}
export function legalPortfolios(){
 const all=Object.keys(DESIGNS),list=[];
 for(const designId of all){
  const p={investments:[{designId,strengthened:true}],strategy:'strengthen'};
  try{validatePortfolio(p);list.push(p)}catch{}
 }
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const p={investments:[{designId:all[i],strengthened:false},{designId:all[j],strengthened:false}],strategy:'extend'};
  try{validatePortfolio(p);list.push(p)}catch{}
 }
 return list;
}
export function validateRecoveryPassport(passport){
 if(passport===null||passport===undefined)return {kind:'standalone',passport:null};
 if(!checkObject(passport)||passport.schema!=='rw.exit.v1'||passport.source?.chapter!=='recover-well'||typeof passport.source.runId!=='string'||!passport.source.runId||!checkObject(passport.established)||!checkObject(passport.dependencies)||!checkObject(passport.resourcesRemaining))
  throw Error('A validated Recover Well exit passport is required for connected Live Well.');
 if(!['HOLDS','STRAINED','EXPOSED'].includes(passport.established.outcome))throw Error('Invalid recovery outcome.');
 if(passport.dependencies.continuingCommunityServiceAccepted!==null||passport.dependencies.ongoingMonitoringOwnerConfirmed!==null)throw Error('Recovery cannot establish future community or monitoring acceptance.');
 return {kind:'connected',passport:cloned(passport)};
}
export function makeLiveStart({recoveryPassport=null}={}){
 const checked=validateRecoveryPassport(recoveryPassport);
 return {schema:'live.start.v1',source:checked.kind,linkedRecovery:checked.passport,...(checked.kind==='connected'?{legacyPolicy:'verified-handoff-v2'}:{}),resources:{capital:CAPITAL,change:CHANGE},note:checked.kind==='standalone'?
  'Authored standalone community starting condition; no earlier hospital or recovery decisions are claimed.':
  'Verified prior chapter evidence carries forward. Community-service availability, ongoing monitoring, transport and clinical acceptance must be established separately.'};
}
export function eventFacts(id,overrides={}){
 if(!SCENARIOS[id])throw Error('Unknown Live Well disruption.');
 if(!checkObject(overrides))throw Error('Scenario facts must be an object.');
 const facts=cloned(SCENARIOS[id].facts);
 for(const [key,val] of Object.entries(overrides)){
  if(!(key in facts)||typeof val!=='boolean')throw Error('Unknown or invalid scenario fact: '+key);
  facts[key]=val;
 }
 return facts;
}
function capabilityEffect(id,scenario,f,strengthened,response){
 const active=response!=='ordinary';
 if(!active)return null;
 const strong=strengthened;
 const result=(kind,participation,agency,burden,required,reason,used=true)=>({designId:id,kind,participation,agency,burden,required,reason,strengthenedUsed:strong&&used});
 if(scenario==='S1'){
  switch(id){
   case '1A': if(f.alternativeRouteExists&&f.alternativeRouteAccessible&&f.alternativeRouteVerified&&f.routeFitsArthur&&(f.currentRouteData||(strong&&f.offlineGuideUsable)))return result('guided-detour',true,'high',strong?1:2,[], 'Arthur understands a verified usable detour.',strong&&!f.currentRouteData);break;
   case '1B': if(f.alternativeRouteExists&&f.alternativeRouteAccessible&&f.routeFitsArthur&&(f.alternativeRouteVerified||(strong&&f.physicalWayfindingAvailable)))return result('built-detour',true,'high',strong?0:1,[],'A usable accessible detour is physically legible.',strong&&!f.alternativeRouteVerified);break;
   case '1C': if(f.pickupAccessible&&((f.accessibleTransportAvailable&&f.transportRequestAccepted)||(strong&&f.backupTransportAvailable&&f.assistanceAccepted)))return result('accepted-ride',true,'high',strong?1:2,[],'A real accessible ride is accepted.',strong&&!f.transportRequestAccepted);break;
   case '3A': if(f.alternativeRouteExists&&f.alternativeRouteAccessible&&f.routeFitsArthur&&f.alternativeRouteVerified)return result('pacing-detour',true,'high',2,[],'Approved pacing helps Arthur take a known accessible detour.',false);break;
   case '3B': break; // A personal health companion is not a dedicated mobility route provider.
   case '3C': break;
   case '4B': break; // An accessible community hub does not establish the journey to it.
   case '4C': if(f.assistanceAccepted&&f.transportRequestAccepted&&f.accessibleTransportAvailable&&f.pickupAccessible)return result('concierge-ride',true,'medium',1,[],'A real person coordinates accepted accessible transport.',false);break;
  }
 }
 if(scenario==='S2'){
  // Unusual new fatigue requires accepted qualified advice; activity coaching or AI cannot confer clinical clearance.
  const qualified=f.assessmentAccepted&&f.assessmentQualified&&f.assessmentWithinWindow;
  const safe=f.safeRestAvailable;
  if(!safe)return null;
  switch(id){
   case '2A': if(f.podAccessible&&f.podOperational&&f.podEquipmentReady&&f.podClinicianAccepted&&qualified)return result('pod-assessment',true,'high',strong?1:2,[],'Qualified assessment is accepted through an operational care pod.',strong);break;
   case '2B': if(f.referralAccepted&&f.referralCapacity&&qualified)return result('network-assessment',true,'high',strong?1:2,[],'A qualified local assessment is accepted through the network.',strong);break;
   case '2C': if(f.mobileServiceAccepted&&f.mobileServiceCapacity&&qualified)return result('mobile-assessment',true,'medium',strong?1:2,[],'A staffed appropriate mobile service accepts the assessment.',strong);break;
   case '3A': if(qualified&&f.currentApprovedGoals&&f.approvedActivityEnvelope&&f.walkingFeedbackValid)return result('supported-pacing-and-assessment',true,'high',strong?2:3,[],'Arthur pauses, uses approved cues and obtains qualified advice.',strong);break;
   case '3B': if(qualified&&f.clinicalContextCurrent&&(f.remoteAdviceAccepted||f.ordinaryContactAvailable))return result('context-supported-assessment',true,'high',strong?1:2,[],'Current clinical context accompanies an accepted qualified consultation.',strong);break;
   case '3C': if(qualified&&f.remoteParticipationAccepted)return result('remote-participation-after-care',true,'high',strong?1:2,[],'Arthur accepts a participation alternative after qualified advice.',strong);break;
   case '4C': if(qualified&&f.ordinaryContactAvailable&&f.communityConciergeAccepted)return result('coordinated-assessment',true,'medium',strong?2:3,[],'The accepted assessment and next step are coordinated.',strong);break;
   case '4A': if(qualified&&f.safeRestAvailable&&f.communityReturnPossible&&f.participationSupportAccepted&&f.participationStaffAvailable)return result('supported-activity-return',true,'high',strong&&f.participationBackupReady?1:2,[],'Staff provide a confirmed accessible rest area and shorter participation format after qualified advice.',strong&&f.participationBackupReady);break;
   case '1C': if(qualified&&f.transportRequestAccepted&&f.transportCapacity&&f.agreedPlanForReturningHome)return result('ride-home-after-advice',false,'high',1,[],'Accepted transportation helps Arthur return home.',strong);break;
  }
 }
 if(scenario==='S3'){
  switch(id){
   case '1A': if(f.updatedEventKnown&&f.officialUpdateVerified&&f.routeToNewVenueAccessible&&f.usableTravelAvailable&&f.alternateVenueConfirmed&&f.alternateVenueAccessible)return result('updated-guide',true,'high',strong?1:2,[],'A verified update and accessible journey reach the new venue.',strong);break;
   case '1B': if(f.updatedEventKnown&&f.routeToNewVenueAccessible&&f.usableTravelAvailable&&f.alternateVenueConfirmed&&f.alternateVenueAccessible)return result('physical-alternative',true,'high',1,[],'The new destination is accessible and known.',false);break;
   case '1C': if(f.updatedEventKnown&&f.changedTransportAccepted&&f.usableTravelAvailable&&f.alternateVenueConfirmed&&f.alternateVenueAccessible)return result('changed-transport',true,'medium',strong?1:2,[],'Accepted transport adapts to the new destination.',strong);break;
   case '3C': if(f.alternateParticipationOffered&&f.remoteParticipationAccepted)return result('accepted-remote-participation',true,'high',strong?1:2,[],'Arthur chooses an accepted accessible alternative to being there.',strong);break;
   case '4A': if(f.alternateVenueConfirmed&&f.alternateVenueAccessible&&f.usableTravelAvailable&&f.eventParticipationSupportAccepted&&f.eventParticipationStaffAvailable)return result('adapted-in-person-gathering',true,'high',strong&&f.eventParticipationBackupReady?1:2,[],'The replacement gathering confirms staffed flexible seating, rest and an agreed shorter participation option.',strong&&f.eventParticipationBackupReady);break;
   case '4B': if(f.communityHubActive&&f.alternateVenueConfirmed&&f.alternateVenueAccessible&&f.alternateVenueStaffed&&((strong&&f.communityHubConfirmed)||f.eventOrganizerConfirmed)&&f.usableTravelAvailable)return result('confirmed-community-hub',true,'high',strong?0:1,[],'A staffed accessible substitute venue and travel are confirmed.',strong&&!f.eventOrganizerConfirmed);break;
   case '4C': if(f.conciergeAvailable&&(f.conciergeAccepted||(strong&&f.backupConciergeAvailable&&f.backupConciergeAccepted))&&f.alternateVenueConfirmed&&f.alternateVenueAccessible&&f.usableTravelAvailable)return result('coordinated-relocation',true,'high',strong?1:2,[],'A responsible person confirms the usable relocation.',strong&&!f.conciergeAccepted);break;
   case '2B': break; // A distributed clinical care network is not an event relocation system.
  }
 }
 return null;
}
function ordinaryPath(s,f){
 if(s==='S1')return {designId:null,kind:'ordinary-delay-or-return',participation:false,agency:'high',burden:3,reason:'Arthur avoids an unverified inaccessible route; participation is deferred.',strengthenedUsed:false};
 if(s==='S2'){
  if(!f.safeRestAvailable)return {designId:null,kind:'no-safe-rest',participation:false,agency:'low',burden:4,reason:'Arthur has no established safe rest position.',strengthenedUsed:false};
  if(f.ordinaryContactAvailable&&f.assessmentAccepted&&f.assessmentQualified&&f.assessmentWithinWindow)return {designId:null,kind:'ordinary-qualified-assessment',participation:false,agency:'high',burden:3,reason:'Arthur pauses and obtains accepted qualified assessment through an ordinary route.',strengthenedUsed:false};
  return {designId:null,kind:'unresolved-health-concern',participation:false,agency:'medium',burden:4,reason:'Arthur pauses, but qualified assessment is not established.',strengthenedUsed:false};
 }
 return {designId:null,kind:'ordinary-event-deferral',participation:false,agency:'high',burden:3,reason:'Arthur does not assume an unconfirmed replacement event is accessible.',strengthenedUsed:false};
}
export function responseOptions({investments,strategy,scenarioId,budget=null}){
 const validated=validatePortfolio({investments,strategy});
 if(!SCENARIOS[scenarioId])throw Error('Unknown Live Well disruption.');
 const available=budget||validated.remaining;
 if(!checkObject(available)||!Number.isInteger(available.capital)||!Number.isInteger(available.change)||available.capital<0||available.change<0||available.capital>CAPITAL||available.change>CHANGE)throw Error('Invalid remaining resources.');
 return Object.fromEntries(Object.entries(RESPONSE_COSTS).map(([id,cost])=>[id,{cost,eligible:true,affordable:available.capital>=cost.capital&&available.change>=cost.change}]));
}
function classify({scenarioId,path,options,facts}){
 const qualified=facts.assessmentAccepted&&facts.assessmentQualified&&facts.assessmentWithinWindow;
 const safe=scenarioId!=='S2'||(facts.safeRestAvailable&&qualified);
 // Accepted qualified assessment and permission/opportunity to resume community activity are separate facts.
 const participated=!!path.participation&&safe&&(scenarioId!=='S2'||facts.communityReturnPossible);

 const agency=path.agency;
 const burden=path.burden+(options.response==='coordinate'?1:0);
 const outcome=!safe?'EXPOSED':participated?'HOLDS':'STRAINED';
 const future=!safe||(!participated&&burden>=3)?'FRAGMENTED':participated&&agency==='high'&&burden<=2?'ADAPTABLE_ACCOUNTABLE':'CONNECTED_FRAGILE';
 return {outcome,future,participation:participated,agency,burden,safetyEstablished:safe};
}
export function evaluateLiveWell({start=makeLiveStart(),investments,strategy,scenarioId,response='use',facts:overrides={}}){
 if(!checkObject(start)||start.schema!=='live.start.v1'||!['connected','standalone'].includes(start.source)||!checkObject(start.resources))throw Error('Invalid Live Well start.');
 if(start.resources.capital!==CAPITAL||start.resources.change!==CHANGE)throw Error('Prior chapter resources cannot change the Live Well allocation.');
 if(start.source==='connected')validateRecoveryPassport(start.linkedRecovery);
 else if(start.linkedRecovery!==null)throw Error('Standalone play cannot imply a prior chapter.');
 const budget=validatePortfolio({investments,strategy}),options=responseOptions({investments,strategy,scenarioId}),responseOption=options[response];
 if(!responseOption)throw Error('Unknown Live Well response.');
 if(!responseOption.affordable)throw Error('This response exceeds remaining resources.');
 const facts=eventFacts(scenarioId,overrides),capital=budget.remaining.capital-responseOption.cost.capital,change=budget.remaining.change-responseOption.cost.change;
 const base=ordinaryPath(scenarioId,facts);
 const paths=investments.map(i=>capabilityEffect(i.designId,scenarioId,facts,strategy==='strengthen',response)).filter(Boolean);
 // Repairs and coordination are earned routes, not a generic score bonus. Extra capacity must be confirmed by scenario facts.
 const ids=new Set(investments.map(i=>i.designId));
 if(response==='adapt'&&scenarioId==='S1'&&facts.adaptedDetourVerified&&facts.alternativeRouteExists&&facts.alternativeRouteAccessible&&facts.routeFitsArthur&&['1A','1B','3A'].some(id=>ids.has(id)))
  paths.push({designId:investments.find(i=>['1A','1B','3A'].includes(i.designId)).designId,kind:'verified-local-detour',participation:true,agency:'high',burden:1,reason:'An actual alternate route was verified and adapted for Arthur.',strengthenedUsed:false});
 if(response==='adapt'&&scenarioId==='S3'&&facts.adaptedParticipationAccepted&&facts.alternateParticipationOffered&&['3C','4B'].some(id=>ids.has(id)))
  paths.push({designId:investments.find(i=>['3C','4B'].includes(i.designId)).designId,kind:'confirmed-participation-alternative',participation:true,agency:'high',burden:1,reason:'Arthur accepts an actually supported alternative way to join.',strengthenedUsed:false});
 if(response==='coordinate'&&scenarioId==='S1'&&facts.coordinatedTransportAccepted&&facts.accessibleTransportAvailable&&facts.pickupAccessible&&['1C','4C'].some(id=>ids.has(id)))
  paths.push({designId:investments.find(i=>['1C','4C'].includes(i.designId)).designId,kind:'coordinated-accepted-ride',participation:true,agency:'high',burden:1,reason:'Accessible transport formally accepts the new route and pickup.',strengthenedUsed:false});
 if(response==='coordinate'&&scenarioId==='S2'&&facts.coordinatedAssessmentConfirmed&&facts.safeRestAvailable&&facts.assessmentAccepted&&facts.assessmentQualified&&facts.assessmentWithinWindow&&['2B','3B','4C'].some(id=>ids.has(id)))
  paths.push({designId:investments.find(i=>['2B','3B','4C'].includes(i.designId)).designId,kind:'coordinated-qualified-advice',participation:true,agency:'high',burden:1,reason:'A qualified service actually accepts the assessment and agrees an appropriate next step.',strengthenedUsed:false});
 if(response==='coordinate'&&scenarioId==='S3'&&facts.coordinatedRelocationAccepted&&facts.alternateVenueConfirmed&&facts.alternateVenueAccessible&&facts.usableTravelAvailable&&['1C','4B','4C'].some(id=>ids.has(id)))
  paths.push({designId:investments.find(i=>['1C','4B','4C'].includes(i.designId)).designId,kind:'coordinated-venue-transfer',participation:true,agency:'high',burden:1,reason:'The venue and usable travel are confirmed by an accepted community coordinator.',strengthenedUsed:false});
 const usable=response==='ordinary'?[]:paths;
 let selected=usable.sort((a,b)=>Number(b.participation)-Number(a.participation)||a.burden-b.burden)[0]||base;
 // Adapt means an actual repair route. It cannot make unverified capacity or clinical acceptance appear.
 if(response==='adapt'&&scenarioId==='S2'&&facts.approvedLocalAdjustmentAvailable&&selected.designId&&selected.burden>0)selected={...selected,burden:Math.max(0,selected.burden-1),reason:selected.reason+' An approved local adjustment reduces effort.'};
 // Coordinate adds coordination burden unless a real accepted service actually participates.
 if(response==='coordinate'&&selected.designId===null)selected={...base,reason:base.reason+' Coordination was requested but no usable service was established.'};
 // Two independently supported investments can provide a real fallback.
 // Both paths must already be usable in this event; a second purchase alone is not enough.
 const fallbackPaths=usable.filter(p=>p.designId&&p.designId!==selected.designId&&p.participation&&selected.participation);
 const fallback=investments.length===2&&fallbackPaths.length>0
  ?fallbackPaths.sort((a,b)=>a.burden-b.burden)[0]:null;
 const fallbackEarned=start.legacyPolicy==='verified-handoff-v2'&&!!fallback&&selected.burden>0;
 if(fallbackEarned)selected={...selected,burden:selected.burden-1,
  reason:selected.reason+' A second independently usable funded pathway reduced reliance on one response.'};
  const selectedInvestment=investments.find(i=>i.designId===selected.designId);
 const unstrengthened=selectedInvestment&&strategy==='strengthen'
  ?capabilityEffect(selected.designId,scenarioId,facts,false,response):null;
 const realizedStrength=strategy==='strengthen'&&!!selected.designId&&
  (!unstrengthened||!unstrengthened.participation&&selected.participation||unstrengthened.burden>selected.burden);
 // Evidence-based Design Legacy: an accepted qualified assessment can use verified
 // prior clinical context to avoid one unit of repeated information work.
 // This cannot alter clinical safety, participation, physical access or service capacity.
 const legacyEnabled=['verified-handoff-v1','verified-handoff-v2'].includes(start.legacyPolicy)&&start.source==='connected';
 const upstream=legacyEnabled?start.linkedRecovery:null;
 const verifiedPrior=!!upstream&&(upstream.established.priorClinicalContextUsable===true||upstream.established.contextReconciledInRecovery===true);
 const ordinaryAccepted=scenarioId==='S2'&&selected.kind==='ordinary-qualified-assessment'&&start.legacyPolicy==='verified-handoff-v2';
 const usingQualifiedPath=scenarioId==='S2'&&(ordinaryAccepted||selected.designId!==null)&&
  ['pod-assessment','network-assessment','mobile-assessment','supported-pacing-and-assessment','context-supported-assessment','remote-participation-after-care','coordinated-assessment','supported-activity-return','coordinated-qualified-advice'].includes(selected.kind);
 const currentUsable=facts.clinicalContextCurrent&&facts.assessmentAccepted&&facts.assessmentQualified&&facts.assessmentWithinWindow;
 const continuityApplied=!!(verifiedPrior&&usingQualifiedPath&&currentUsable&&selected.burden>0);
 const designLegacy={fallbackUsed:fallbackEarned?fallback.designId:null,status:continuityApplied?'enabled':usingQualifiedPath&&upstream?'requires-verification':'not-used',
  reduction:continuityApplied?1:0,
  explanation:continuityApplied?'Verified earlier clinical context is current and usable by this accepted qualified service, reducing Arthur’s repeated handoff work.':usingQualifiedPath&&upstream?'Earlier context exists as a record, but its current receiving-service usability was not established; no benefit was assumed.':'Earlier investments remain in Arthur’s history but were not used by this event.',
  recoveryRunId:upstream?.source?.runId||null,
  leaveWellRunId:upstream?.source?.leaveWellRunId||null};
 if(continuityApplied)selected={...selected,burden:selected.burden-1};
  const metrics=classify({scenarioId,path:selected,options:{response},facts});
 return {schema:LIVE_WELL_VERSION,scenarioId,response,strategy,investments:cloned(investments),startSource:start.source,
  ...(legacyEnabled?{designLegacy}:{}),priorRecovery:start.source==='connected'?{runId:start.linkedRecovery.source.runId,outcome:start.linkedRecovery.established.outcome,unresolved:cloned(start.linkedRecovery.dependencies.unresolved)}:null,
  spent:{capital:CAPITAL-capital,change:CHANGE-change},remaining:{capital,change},metrics,
  route:{id:selected.kind,designId:selected.designId,reason:selected.reason,contributedStrength:!!realizedStrength},
  considered:usable.map(x=>({id:x.designId,path:x.kind,participation:x.participation})),
  unmet:metrics.outcome==='EXPOSED'?['Qualified response or safe activity cannot be established.']:metrics.outcome==='STRAINED'?['Arthur’s intended participation was not completed.']:[],
  guardrail:'A single event outcome does not prove community-wide readiness, ongoing care entitlement or clinical safety outside this scenario.'};
}
