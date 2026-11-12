import {CHOICES,STRENGTHEN} from './recoveryContent.js';

// Player language follows the chosen connected route, never the most flattering unused card.
export function causalSentence(result){
 const p=result.path;
 if(result.outcome==='STRAINED'){
  const fact=result.burdenEvidence[0]?.fact;
  if(fact==='outageNeedsManualWorkaround')return 'Your design became strained because Arthur needs a temporary manual alternative while his robot cannot complete the task.';
  if(fact==='designedAssessmentNeedsAdditionalHandoff')return 'Your design became strained because Arthur’s assessment needs an additional, unplanned handoff before his next step.';
  return 'Your design became strained because Arthur must repeat information that did not reach the accepted assessment service.';
 }
 if(result.outcome==='EXPOSED'){
  if(p.id==='outage-local-continuation')return p.chain.find(c=>c.function==='UNDERSTOOD')?.status==='Not established'
   ? 'Your design was exposed because the selected robot’s safe operating state is not established for Arthur.'
   : p.gaps.some(g=>g.includes('instruction'))?'Your design was exposed because Arthur lacks current, accessible instructions for the routine he needs to continue.'
   : 'Your design was exposed because Arthur’s robot task has no established completion method or safe deferral.';
  if(p.id.startsWith('routine-')&&p.gaps.some(g=>/approved routine/i.test(g)))return 'Your design was exposed because Arthur’s routine has not been approved; a suitable space cannot authorize it.';
  if(p.id.startsWith('routine-'))return !p.chain.some(c=>c.function==='UNDERSTOOD'&&c.status==='Established')
   ? 'Your design was exposed because task assistance alone does not explain why Arthur’s recovery has slowed.'
   : 'Your design was exposed because Arthur’s selected routine lacks a usable setup, accepted coverage or permitted adjustment.';
  const gaps=p.gaps.join(' ');
  if(/changed plan|sufficient context/.test(gaps))return 'Your design was exposed because the accepted reviewer lacks the information needed to assess Arthur’s concern.';
  if(/staff\/equipment/.test(gaps))return 'Your design was exposed because the home-care staff or equipment Arthur’s assessment requires are not available.';
  if(/eligibility/.test(gaps))return 'Your design was exposed because Arthur’s eligibility for the selected home-care episode has not been established.';
  if(/suitability/.test(gaps))return 'Your design was exposed because Arthur’s home does not yet provide the setup required for this care.';
  if(/window/.test(gaps))return 'Your design was exposed because Arthur’s assessment cannot reach its required milestone within the available time.';
  return 'Your design was exposed because Arthur’s concern still lacks an established, accepted route to qualified assessment and action.';
 }
 if(p.id==='outage-local-continuation')return p.benefit.includes('independent local task mode')
  ? 'Your design held because Arthur’s robot has a permitted local mode to continue its task during the outage.'
  : p.benefit.includes('can safely wait')?'Your design held because Arthur’s robot stops safely and its bounded task can wait through the outage.'
  : p.benefit.includes('alternate method')?'Your design held because Arthur has an available alternative method for the task his stopped robot cannot complete.'
  : 'Your design held because Arthur’s approved routine has usable local instructions and can continue without home broadband.';
 if(p.id.startsWith('routine-'))return ({
  'routine-coaching':'Your design held because Arthur’s accepted coach supports an appropriate routine adjustment within the agreed limits.',
  'routine-rehab-home':'Your design held because Arthur’s rehabilitation space supports the identified routine adjustment within his approved limits.',
  'routine-supportive-home':'Your design held because Arthur’s home setup fits the identified routine adjustment within his approved limits.',
  'routine-guided-movement':'Your design held because Arthur’s approved movement guidance supports an appropriate adjustment to his slowed recovery.'
 })[p.id]||'Your design held because Arthur has a usable way to adjust his routine within its approved limits.';
 if(result.repair)return 'Your design held because qualified reconciliation supplied the missing context and Arthur’s accepted assessment could proceed in time.';
 if(result.contextReconstruction)return 'Your design held because a fresh, accepted assessment established enough information to address Arthur’s concern in time.';
 return 'Your design held because Arthur’s concern reached accepted qualified assessment with the information and capacity needed in time.';
}
export function designContributions(result,investments){
 return investments.map(i=>({designId:i.designId,title:CHOICES[i.designId].title,
  used:result.path.designIds.includes(i.designId),
  role:result.path.designIds.includes(i.designId)?'Contributes to the pathway used for Arthur.':'Selected, but not required by the pathway used for this event.',
  strengthened:i.strengthened?STRENGTHEN[i.designId]:null}));
}

export function arthurStory(result){
 const p=result.path,clinical=!p.id.startsWith('routine-')&&p.id!=='outage-local-continuation';
 const known=result.scenarioGivens[0].detail;
 let worked=known;
 if(p.complete)worked+=' '+(clinical?'Qualified assessment, accepted responsibility and timely action are established for this concern.':p.id==='outage-local-continuation'?p.benefit:'The selected routine route supports an adjustment inside Arthur’s approved limits.');
 else {
  const contribution=p.designIds.map(id=>CHOICES[id].title).join(' and ');
  if(contribution)worked+=' '+contribution+' remains a selected contribution; its presence alone does not establish the required next step.';
 }
 const breakpoint=result.outcome==='EXPOSED'?p.gaps.join(' '):result.outcome==='STRAINED'?result.burdenEvidence.map(b=>b.detail).join(' '):'No required link is missing in the pathway used for this event. This does not establish every possible service or future need.';
 const experience=result.outcome==='EXPOSED'?'Arthur’s situation is known, but the required next step is not established under these conditions.':result.outcome==='STRAINED'?'A viable next step is established for Arthur, with the specific additional work described above.':clinical?'Arthur reaches accepted qualified assessment and an appropriate next step within the required window.':p.id==='outage-local-continuation'?p.benefit.includes('can safely wait')?'Arthur’s robot remains stopped while its bounded task safely waits through the outage.':p.benefit.includes('independent local task mode')?'Arthur’s selected robot task has a permitted local route during the outage.':p.benefit.includes('alternate method')?'Arthur has a self-performed alternative for the stopped robot’s task.':'Arthur’s approved routine can continue through local instructions and ordinary home features.':'Arthur can adjust the identified routine or setup within the approved limits; this is not clinical reassessment.';
 let consequence;
 if(result.outcome==='EXPOSED'){
  const gaps=p.gaps.join(' ');
  consequence=p.id==='outage-local-continuation'?'Design a usable local instruction route and, for a necessary device task, an actual completion method or safe deferral.':p.id.startsWith('routine-')?'Check the actual task fit, permitted adjustment and any accepted coaching coverage. An extra purchase cannot replace those conditions.':/suitability/.test(gaps)?'Arthur’s home needs the episode-specific setup. Space can enable care, while eligibility, staff, equipment and acceptance remain separate.':/changed plan|sufficient context/.test(gaps)?'Carry verified relevant context into accepted assessment, or establish it through an available qualified review. More observations alone cannot repair that gap.':'Additional sensing or coordination cannot substitute for qualified interpretation, accepted responsibility, actual service capacity and timely action.';
 }else if(result.outcome==='STRAINED')consequence='The remaining burden belongs to this actual route. Improve that handoff or fallback rather than assuming another device removes the work.';
 else consequence=p.id.startsWith('routine-')?'The usable routine route can stand on its own. A separate unavailable service does not erase that physical or bounded contribution.':p.id==='outage-local-continuation'?'Resilience comes from an actual local route, usable alternative or safe deferral—not connectivity alone.':result.repair?'Qualified reconciliation addressed the recovery-local context gap; the recorded Leave Well history remains unchanged.':result.contextReconstruction?(result.inheritance.planBefore==='open'?'Fresh assessment supplied context for today’s concern. It did not repair the earlier discharge-plan record.':'Fresh assessment supplied context for today’s concern. The earlier transition record remains unchanged.'):'The design helped only alongside actual information, qualified acceptance, capacity and timing. Buying the route did not create those services.';
 return {worked,breakpoint,experience,consequence};
}
