import {CHOICES,SCENARIOS,scenario,VERSION,COSTS} from './recoveryContent.js';
import {connectionEvidence} from './recoveryConnections.js';
import {validateHandoff} from './leaveWellHandoff.js';
const established=(functionId,actor,scope,evidence)=>({function:functionId,status:'Established',actor,scope,evidence});
const missing=(functionId,evidence)=>({function:functionId,status:'Not established',actor:null,scope:null,evidence});
const order=['KNOWN','UNDERSTOOD','OWNED','ACTED','CONTINUES'];
export function resolveRecovery({handoff,investments=[],scenarioId='S2',facts={},response='use',shareMovement=false}){
 const h=validateHandoff(handoff),s=scenario(scenarioId,facts),f=s.facts;
 if(!Array.isArray(investments)||!investments.length||investments.length>2||investments.some(i=>!CHOICES[i.designId]||typeof i.strengthened!=='boolean')||new Set(investments.map(i=>i.designId[0])).size!==investments.length)throw Error('Invalid recovery portfolio.');
 if(!['use','adapt','escalate','ordinary'].includes(response))throw Error('Unknown response.');
 if(investments.length>1&&investments.some(i=>i.strengthened))throw Error('Strengthen and Extend cannot be combined.');
 const has=id=>investments.some(i=>i.designId===id),strong=id=>investments.some(i=>i.designId===id&&i.strengthened===true),any=ids=>ids.some(has);
 const verified=h.facts.verifiedTransitionPlan.state==='established'&&f.inheritedContextStillCurrent===true;
 const portable=h.facts.portableMedicationContext.state==='established'&&f.inheritedContextStillCurrent===true&&f.medicationContextSufficient===true&&f.receiverParticipatesInPortableContext===true;
 const confirmed=verified&&(f.planCopyReachable===true||portable)&&f.receiverCanUseContext===true;
 const localEssentialsReady=verified&&f.localEssentialsAvailable===true&&f.localEssentialsUsable===true;
 const clinicalScope=['1A','1C','3A','3B','3C','4A','4B','4C'];
 const contextRepair=response==='adapt'&&any(clinicalScope)&&!confirmed&&f.receiverCanUseContext===true&&f.reconciliationAvailable===true&&f.reconciliationAccepted===true&&f.reconciliationWithinWindow===true;
 const context=confirmed||contextRepair;
 const selectedIds=investments.map(i=>i.designId);
 const connections=connectionEvidence(investments,f,shareMovement);
 const homeSetupRealized=connections.some(c=>c.interface?.id==='homeEpisodeSetup'&&c.enabled);
 const movementInputsAvailable=connections.some(c=>c.interface?.id==='consentedMovementInputs'&&c.enabled);
 const scenarioGivens=[{function:'KNOWN',fact:'initialConcern',scope:s.id,detail:s.known}];
 const paths=[],trace=[{source:'scenario',fact:'initialConcern',detail:s.known},{source:'leave-well',fact:'verifiedTransitionPlan',state:h.facts.verifiedTransitionPlan.state,detail:h.facts.verifiedTransitionPlan.reason}];
 trace.push({source:'handoff-interface',fact:'contextAccess',detail:confirmed?(portable&&!f.planCopyReachable?'The inherited participating-setting medication context supplies the specific evidence needed by this receiving service.':'The verified context is reachable and usable by this receiving service.'):verified?'The source plan was verified, but access or receiving-service usability is not established.':'Relevant current plan verification is not established.'});
 if(homeSetupRealized)trace.push({source:'portfolio-interface',fact:'homeEpisodeSetup',detail:'The selected Recovery-Ready Home funds the task-specific setup for the selected home-care episode, within a home explicitly able to accommodate it. Eligibility, staff and equipment remain separate.'});
 if(contextRepair)trace.push({source:'recovery-response',fact:'reconciledClinicalContext',detail:'An accepted qualified reviewer reconciles the context required for this recovery event within the window. Leave Well history stays unchanged.'});
 const observations=[];
 if(has('3A'))observations.push(f.wearableValid===true?'Valid selected wearable observations':'Wearable signal quality is not established');
 if(has('3B'))observations.push(f.ambientValid===true?'Valid observations in selected consented zones':'Ambient signal quality is not established');
 const forecast=has('3C')&&(f.minimumForecastEvidence===true||movementInputsAvailable);
 if(has('3C'))observations.push(forecast?'Forecast uses sufficient legitimate inputs with uncertainty':'Forecast abstains: minimum legitimate evidence is not established');
 if(movementInputsAvailable)trace.push({source:'portfolio-interface',fact:'consentedMovementInputs',detail:'Selected approved rehab observations may inform the forecast. No wearable or ambient sensor is added.'});
 const reasonFact=(key,label)=>f[key]===true?null:f[key]===false?label+' is unavailable or not accepted in this fixture.':label+' has not been established.';
 function path(id,{actor,scope,designIds=[],required=s.required,under=true,owned=true,acted=true,continues=true,gaps=[],burdenEvidence=[],evidence={},action='Appropriate action initiated',benefit='',localTaskMode=null,instructionSource=null}){
  const values={KNOWN:scenarioGivens.some(g=>g.function==='KNOWN'),UNDERSTOOD:under,OWNED:owned,ACTED:acted,CONTINUES:continues};
  const chain=order.map(k=>k==='KNOWN'?established(k,'Arthur / event facts',s.id,s.known):!required.includes(k)?{function:k,status:'Not required',actor:null,scope,evidence:'This complete event pathway does not require this function.'}:values[k]?established(k,actor,scope,evidence[k]||(k==='ACTED'?action:k==='CONTINUES'?'A viable recovery or safety next step covers the '+s.window.toLowerCase()+' window.':k==='OWNED'?'The named actor has accepted this task within the stated scope.':benefit||'The relevant fact is interpreted within this actor’s appropriate scope.')):missing(k,gaps.filter(Boolean).join(' ')||'This pathway does not establish the required function.'));
  const complete=required.every(k=>values[k]===true);
  paths.push({id,actor,scope,designIds,localTaskMode,instructionSource,concern:s.id,complete,burden:burdenEvidence.length>0,burdenEvidence,chain,gaps:gaps.filter(Boolean),action,benefit});
 }
 // A clinical path is a single connected assessment/ownership/action contract, never maxima from unrelated cards.
 function clinicalPath(id,{routeReady,coverage=true,home=false,review=false,designIds=[]}){
  const external=response==='escalate'||response==='ordinary';
  const reconstructionRequired=external&&f.clinicalContextRequired!==false&&!context;
  const clinicalContext=f.clinicalContextRequired===false||context||reconstructionRequired&&f.assessmentCanReconstructContext===true;
  const gaps=[!clinicalContext?(reconstructionRequired?'A fresh qualified assessment cannot establish sufficient context under the declared facts.':'The relevant changed plan has not been verified; the routed task lacks the required clinical context.'):null,!routeReady?'The chosen design does not initiate an accepted assessment route under these facts.':null,!coverage?'The selected service does not cover this contact.':null,reasonFact('assessmentAvailable','Qualified assessment'),reasonFact('assessmentAccepted','Qualified assessment acceptance'),reasonFact('assessmentWithinWindow','Assessment within the scenario window'),home?reasonFact('homeCareEligible','Home-care eligibility'):null,home?reasonFact('homeCareCapacity','Home-care staff/equipment capacity'):null,home&&!homeSetupRealized?reasonFact('homeSuitable','Home suitability'):null];
  const acceptance=routeReady&&coverage&&f.assessmentAccepted===true&&(home?f.homeCareEligible===true:true);
  const ready=clinicalContext&&acceptance&&f.assessmentAvailable===true&&f.assessmentWithinWindow===true&&(!home||f.homeCareCapacity===true&&(f.homeSuitable===true||homeSetupRealized));
  const reconstructed=ready&&reconstructionRequired;
  const burdenEvidence=[];
  if(response==='ordinary'&&f.ordinaryAssessmentNeedsRepeatedHistory===true)burdenEvidence.push({fact:'ordinaryAssessmentNeedsRepeatedHistory',detail:'Arthur must repeat history he already supplied because it was not carried into the ordinary assessment.',source:'declared scenario fact'});
  if(response==='escalate'&&f.escalatedAssessmentNeedsRepeatedHistory===true)burdenEvidence.push({fact:'escalatedAssessmentNeedsRepeatedHistory',detail:'Arthur must repeat history he already supplied because it was not carried into the escalated assessment.',source:'declared scenario fact'});
  if(!external&&f.designedAssessmentNeedsAdditionalHandoff===true)burdenEvidence.push({fact:'designedAssessmentNeedsAdditionalHandoff',detail:'The designed assessment requires an additional unplanned handoff between services.',source:'declared scenario fact'});
  const interpretation=reconstructed?'The accepted qualified reviewer establishes sufficient context from a fresh assessment and interprets this concern. The earlier transition record is unchanged.':f.clinicalContextRequired===false?'The accepted qualified reviewer interprets this concern without needing the disputed prior-plan component.':'The accepted qualified reviewer interprets this concern using the available verified context.';
  path(id,{designIds,actor:home?'Accepted qualified home-care clinician':'Accepted qualified assessment service',scope:'Clinical assessment of this reported concern',required:order,under:ready,owned:acceptance,acted:ready,continues:ready,gaps,burdenEvidence:ready?burdenEvidence:[],action:external?'The explicitly requested qualified assessment is completed within the declared window and an appropriate next step begins.':'The connected qualified assessment reaches its milestone and an appropriate next step begins.',evidence:{UNDERSTOOD:interpretation,OWNED:'The qualified assessment service accepts responsibility for assessing this concern and its next action.'},benefit:reconstructed?'A fresh qualified assessment establishes sufficient context and a viable next step within the declared window. The original Leave Well plan-confirmation record remains unchanged.':review?'Relevant selected observations support the accepted reviewer’s interpretation; the evidence itself does not diagnose.':'Verified context, accepted clinical responsibility and timely action establish the required recovery pathway.'});
  if(reconstructed)paths.at(-1).contextReconstruction={source:'executed-event-response',fact:'freshAssessmentContext',detail:'The accepted qualified service completed a fresh assessment with sufficient context for this concern. This does not reconcile or rewrite the earlier discharge-plan record.'};
 }

 if(!investments.length)path('no-portfolio',{actor:'Arthur',scope:'Baseline recovery',under:false,owned:false,acted:false,continues:false,gaps:['No recovery investment has been selected. Ordinary help remains available.']});
 // Each approved-routine route owns its own fit and responsibility predicates.
 // A second purchase contributes an alternative; it does not inherit ownership of another route.
 if(s.id==='S1'){
  const routineRoutes=[
   {designId:'1B',id:'routine-supportive-home',actor:'Arthur within the approved task envelope',fit:f.homeTaskFits===true||strong('1B')&&f.routineAlternativeAvailable===true&&f.routineAlternativeFits===true,interpreted:f.routineBarrierIdentified===true,fitGap:'Arthur’s selected routine setup does not fit the task.'},
   {designId:'2B',id:'routine-rehab-home',actor:'Arthur within the approved task envelope',fit:f.rehabEnvironmentFits===true||strong('2B')&&f.rehabAlternativeAvailable===true&&f.rehabAlternativeFits===true,interpreted:f.routineBarrierIdentified===true,fitGap:'Arthur’s rehabilitation space does not fit the prescribed task.'},
   {designId:'2A',id:'routine-guided-movement',actor:'Arthur within the approved movement envelope',fit:f.approvedRoutine===true,interpreted:f.routineBarrierIdentified===true,fitGap:'Arthur’s approved movement routine is not established.'},
   {designId:'2C',id:'routine-robotic-task',actor:'Arthur using the selected bounded device',fit:f.robotCompatible===true,interpreted:false,fitGap:'The selected device does not fit Arthur’s bounded task.'},
   {designId:'1C',id:'routine-coaching',actor:'Accepted recovery coach within coaching scope',fit:f.coachAccepted===true&&(f.coachCoverage===true||strong('1C')&&f.backupCoachAvailable===true),interpreted:f.routineBarrierIdentified===true,fitGap:'Accepted coaching and coverage for Arthur’s contact are not established.'}
  ];
  for(const route of routineRoutes.filter(r=>has(r.designId))){
   const coach=route.designId==='1C',act=route.interpreted&&route.fit&&f.approvedRoutine===true&&f.adjustmentWithinEnvelope===true;
   path(route.id,{designIds:[route.designId],actor:route.actor,scope:'Identified routine/setup barrier; no clinical diagnosis',required:coach?order:s.required,evidence:{UNDERSTOOD:'The routine/setup barrier is identified within this design’s scope. Approval and a usable adjustment are checked separately.'},under:route.interpreted,owned:!coach||f.coachAccepted===true,acted:act,continues:act,gaps:[f.approvedRoutine!==true?'An approved routine is not established for this adjustment.':null,!route.interpreted?'Task assistance alone does not explain why Arthur’s recovery plateaued.':null,!route.fit?route.fitGap:null,!f.adjustmentWithinEnvelope?'An adjustment within Arthur’s approved limits is not established.':null],action:'Arthur’s routine is adjusted within the approved limits.',benefit:'The identified routine or setup barrier is addressed within Arthur’s approved limits; qualified reassessment remains separate.'});
  }
 }
 if(s.id!=='S3'){
  if(has('4A'))clinicalPath('routed-assessment',{designIds:['4A'],routeReady:f.receivingAccepted===true&&f.receivingCapacity===true||strong('4A')&&f.alternateRouteAvailable===true&&f.alternateRouteAccepted===true&&f.alternateRouteCapacity===true});
  if(has('4B')){
   clinicalPath('home-assessment',{designIds:homeSetupRealized?['2B','4B']:['4B'],routeReady:true,home:true});
   if(strong('4B'))clinicalPath('home-transfer-fallback',{designIds:['4B'],routeReady:f.transferFallbackAvailable===true&&f.transferFallbackAccepted===true&&f.transferFallbackWithinWindow===true});
  }
  if(has('4C'))clinicalPath('navigator-to-clinician',{designIds:['4C'],routeReady:(f.navigatorAccepted===true&&f.navigatorCoverage===true||strong('4C')&&f.backupNavigatorAccepted===true&&f.backupNavigatorCoverage===true)&&f.receivingAccepted===true&&f.receivingCapacity===true});
  if(has('1C'))clinicalPath('coach-to-clinician',{designIds:['1C'],routeReady:strong('1C')&&f.receivingAccepted===true&&f.receivingCapacity===true,coverage:f.coachAccepted===true&&(f.coachCoverage===true||strong('1C')&&f.backupCoachAvailable===true)});
  if(any(['3A','3B','3C'])){
   const valid=has('3A')&&f.wearableValid===true||has('3B')&&f.ambientValid===true||forecast;
   const reviewArrangement=['3A','3B','3C'].some(strong)&&f.reviewProcessAccepted===true;
   const route=valid&&reviewArrangement&&f.receivingAccepted===true&&f.receivingCapacity===true;
   clinicalPath('evidence-to-review',{designIds:selectedIds.filter(id=>id[0]==='3'),routeReady:route,review:true});
  }
  if(contextRepair)clinicalPath('reconciled-context-to-assessment',{designIds:selectedIds.filter(id=>clinicalScope.includes(id)),routeReady:f.receivingAccepted===true&&f.receivingCapacity===true});
  if(response==='escalate'||response==='ordinary')clinicalPath('explicit-ordinary-assessment',{routeReady:true});
  if(!paths.length)path('limited-selected-contribution',{actor:'Selected recovery design',designIds:selectedIds,scope:'Support only; clinical response remains separate',under:false,owned:false,acted:false,continues:false,gaps:[s.id==='S2'?'A new clinical concern needs accepted qualified same-day interpretation and action.':'The design supports information or a bounded task but does not establish an appropriate adjustment.'],benefit:has('1A')?'The companion can explain ordinary approved instructions.':'The home or device can support a selected task.'});
 }
 if(s.id==='S3'){
  const ordinaryRoutine=f.approvedRoutine===true&&f.ordinaryWrittenRoutine===true&&f.ordinaryRoutineCurrent===true;
  let taskViable=ordinaryRoutine,instructionSource=ordinaryRoutine?'ordinary-written':'none',instructionDesigns=[],benefits=[];
  if(ordinaryRoutine)benefits.push('Ordinary current written instructions and the approved local routine can continue; live optional analytics are not prescribed for these six hours.');
  if(!taskViable&&strong('1A')&&localEssentialsReady&&f.approvedRoutine===true){taskViable=true;instructionSource='funded-offline-essentials';instructionDesigns=['1A'];benefits.push('The funded current offline essentials provide a locally usable instruction route.');}
  if(!taskViable&&strong('2A')&&f.approvedRoutine===true){taskViable=true;instructionSource='funded-local-movement';instructionDesigns=['2A'];benefits.push('Verified local guidance continues within the approved routine; live supervision is not required in this case.');}
  if(strong('1A'))trace.push({source:'local-instruction-interface',fact:'localEssentialsAccess',detail:localEssentialsReady?'Verified current essentials are locally accessible and usable by Arthur, separately from a clinical receiving service.':'Verified current locally accessible essentials are not established for Arthur.'});
  if(instructionSource==='funded-offline-essentials')trace.push({source:'strengthen',fact:'offlineEssentials',detail:'The funded local essentials are backed by a verified current source; cached instructions are not live care.'});
  const instructionGaps=taskViable?[]:['A current accessible instruction route for the necessary routine is not established.'];
  const localPath=(mode,modeReady,modeBenefit,burdenEvidence=[])=>path('outage-local-continuation',{
   designIds:[...instructionDesigns,...(has('2C')?['2C']:[])],actor:'Arthur / verified local task modes',scope:'Necessary routine during this six-hour outage',required:has('2C')?['KNOWN','UNDERSTOOD','ACTED','CONTINUES']:s.required,
   under:!has('2C')||f.robotSafeStop===true,acted:taskViable&&modeReady,continues:taskViable&&modeReady,localTaskMode:mode,instructionSource,
   gaps:[...instructionGaps,...(has('2C')&&f.robotSafeStop!==true?['The robot’s safe operating/stopped state is not established.']:[]),...(!modeReady?['The robot can stop safely, but completion or safe deferral of its necessary bounded task is not established.']:[])],
   action:mode==='safe-deferral'?'The robot stays safely stopped and its bounded task is safely deferred for six hours.':'The necessary local routine continues through the selected usable task method.',benefit:[...benefits,modeBenefit].filter(Boolean).join(' '),burdenEvidence:taskViable&&modeReady?burdenEvidence:[]});
  if(!has('2C'))localPath('ordinary-local',true,'');
  else{
   const local=f.robotCompatible===true&&f.robotLocalMode===true;
   const canActivate=strong('2C')||response==='adapt'||response==='ordinary';
   const alternate=canActivate&&f.robotSafeStop===true&&f.taskAlternativeAvailable===true;
   const defer=canActivate&&f.robotSafeStop===true&&f.safeTaskDeferral===true;
   // Prefer completion when equally burdensome, but not unnecessary manual work over safe deferral.
   if(local)localPath('robot-local',true,'The selected device has a permitted independent local task mode.');
   if(alternate)localPath('self-alternative',true,'Arthur has an actual alternate method for the safely stopped device’s bounded task.',f.outageNeedsManualWorkaround===true?[{fact:'outageNeedsManualWorkaround',detail:'Arthur’s bounded task uses a temporary manual alternative while the robot cannot complete it.',source:'declared scenario fact'}]:[]);
   if(defer)localPath('safe-deferral',true,'The device remains safely stopped; its bounded task can safely wait six hours.');
   if(!local&&!alternate&&!defer)localPath('unresolved-robot',false,'');
  }
  if(any(['3A','3B','3C']))trace.push({source:'outage',fact:'optionalLiveAnalytics',detail:'Cloud-dependent live feeds pause; buffered/cached information does not imply live review. This case does not prescribe live monitoring, so that loss alone does not break the local routine.'});
 }
 const complete=paths.filter(p=>p.complete),chosen=(['ordinary','escalate'].includes(response)?complete.find(p=>p.id==='explicit-ordinary-assessment'):null)||complete.find(p=>!p.burden)||complete[0]||paths.reduce((best,p)=>p.chain.filter(x=>x.status==='Established').length>best.chain.filter(x=>x.status==='Established').length?p:best,paths[0]);
 const strengthUses=[];
 const used=(id,needed,keys,detail)=>{if(strong(id)&&chosen.complete&&chosen.designIds.includes(id)&&needed&&keys.every(k=>f[k]===true)){const record={designId:id,facts:keys,detail,scope:chosen.scope};strengthUses.push(record);trace.push({source:'strengthen',fact:id+'-realized-fallback',detail})}};
 used('1B',chosen.id==='routine-supportive-home'&&f.homeTaskFits!==true,['routineAlternativeAvailable','routineAlternativeFits'],'Arthur uses the actual alternate routine setup, within the approved adjustment limits.');
 used('2B',chosen.id==='routine-rehab-home'&&f.rehabEnvironmentFits!==true,['rehabAlternativeAvailable','rehabAlternativeFits'],'Arthur uses the actual alternate rehabilitation setup, within the prescribed task limits.');
 used('4A',chosen.id==='routed-assessment'&&!(f.receivingAccepted===true&&f.receivingCapacity===true),['alternateRouteAvailable','alternateRouteAccepted','alternateRouteCapacity'],'Arthur’s request reaches accepted qualified assessment through the prepared alternate route, with actual receiving capacity.');
 used('4B',chosen.id==='home-transfer-fallback',['transferFallbackAvailable','transferFallbackAccepted','transferFallbackWithinWindow'],'Arthur uses an accepted, timely transfer route for assessment when the home episode cannot proceed.');
 used('4C',chosen.id==='navigator-to-clinician'&&!(f.navigatorAccepted===true&&f.navigatorCoverage===true),['backupNavigatorAccepted','backupNavigatorCoverage'],'A covered backup navigator coordinates Arthur’s next step; the qualified assessment service accepts clinical responsibility.');
 if(chosen.contextReconstruction)trace.push(chosen.contextReconstruction);
 const outcome=chosen.complete?(chosen.burden?'STRAINED':'HOLDS'):'EXPOSED';
 return {version:VERSION,scenario:s.id,response,outcome,scenarioGivens,connections,strengthUses,evaluationScope:s.scopeNote||null,chain:chosen.chain,burdenEvidence:chosen.burdenEvidence,contextReconstruction:chosen.contextReconstruction||null,path:chosen,consideredPaths:paths,observations,trace,repair:contextRepair?{scope:'Relevant clinical context in this recovery event',source:'accepted-qualified-reconciliation',historicalRunId:h.source.runId}:null,inheritance:{sourceRunId:h.source.runId,planBefore:h.facts.verifiedTransitionPlan.state,priorContextUsable:confirmed,localEssentialsReady,recoveryReconciliationUsed:contextRepair,freshAssessmentContextUsed:!!chosen.contextReconstruction},explanation:chosen.complete?(chosen.burden?'The required pathway is established, with a recorded remaining burden: '+chosen.burdenEvidence.map(x=>x.detail).join(' '):chosen.benefit||'Every required function is established within the declared scope and window.'):chosen.gaps.join(' '),meaning:outcome==='EXPOSED'?'A required design dependency is not established. This is not a prediction of injury.':outcome==='STRAINED'?'A viable next step exists with additional burden or a degraded route.':'The required path holds under the declared operating facts.'};
}
export function recoveryResponseOptions(input){
 const normalized=validateHandoff(input.handoff);const base=resolveRecovery({...input,handoff:normalized,response:'use'}),s=scenario(input.scenarioId,input.facts),f=s.facts,ids=input.investments.map(i=>i.designId),contextOpen=normalized.facts.verifiedTransitionPlan.state!=='established'||f.inheritedContextStillCurrent!==true||f.receiverCanUseContext!==true||f.planCopyReachable!==true&&!(normalized.facts.portableMedicationContext.state==='established'&&f.medicationContextSufficient===true&&f.receiverParticipatesInPortableContext===true);
 const clinical=ids.some(id=>['1A','1C','3A','3B','3C','4A','4B','4C'].includes(id));
 const adapt=s.id==='S3'?ids.includes('2C')&&f.robotSafeStop===true&&(f.taskAlternativeAvailable===true||f.safeTaskDeferral===true):contextOpen&&clinical&&f.receiverCanUseContext===true&&f.reconciliationAvailable===true&&f.reconciliationAccepted===true&&f.reconciliationWithinWindow===true;
 const ordinary=resolveRecovery({...input,handoff:normalized,response:'ordinary'});
 const extra=resolveRecovery({...input,handoff:normalized,response:'escalate'});
 const adapted=adapt?resolveRecovery({...input,handoff:normalized,response:'adapt'}):null;
 const rank=r=>({EXPOSED:0,STRAINED:1,HOLDS:2}[r.outcome]);
 const escalate=s.id!=='S3'&&rank(extra)>Math.max(rank(base),rank(ordinary));
 const adaptChanges=adapt&&base.outcome!=='HOLDS'&&(s.id!=='S3'?adapted.repair!==null:rank(adapted)>Math.max(rank(base),rank(ordinary)));
 return {use:{eligible:true,why:'Use the selected design and its actual accepted arrangements.'},
 adapt:{eligible:adaptChanges,disabledLabel:'NO ADDED EFFECT',why:adaptChanges?'Execute the accepted qualified context reconciliation, or activate the actual bounded task alternative. This does not create clinical capacity.':'No relevant additional Adapt effect is established under these facts.'},
 escalate:{eligible:escalate,disabledLabel:'NO ADDED BENEFIT',why:escalate?'Additional coordination avoids the recorded repeated-history burden of ordinary assessment. Qualified availability, acceptance and timing are unchanged.':'Ordinary help or the funded design provides an equal or better supported result. No distinct added coordination benefit is established.'},
 ordinary:{eligible:true,why:'Explicitly request ordinary clinical or task help at no game-resource charge. Actual availability, acceptance and timing still determine whether it works.'}};
}
