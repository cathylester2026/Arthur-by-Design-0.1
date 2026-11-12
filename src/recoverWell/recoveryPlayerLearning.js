import {DESIGN_LENS} from './recoveryDesignLens.js';
export function earlierChoicesLearning({continuity:c,handoff,result,choiceNames=[]}){
 const checked=handoff.facts.verifiedTransitionPlan.state==='established';
 const earlier=choiceNames.length?'You chose '+choiceNames.join(' and ')+' in Leave Well. ':'';
 const foundation=earlier+(checked?'Arthur left with checked care instructions to share.':'Arthur’s latest care instructions still needed checking when he left hospital.');
 const used=result.path.designIds?.find(id=>DESIGN_LENS[id]);
 const local=used?DESIGN_LENS[used].useful:'The help available today supports Arthur’s next step.';
 const content={
 none:{title:checked?'Your checked plan is there when Arthur needs it.':'Today’s help can work without those changed instructions.',now:'For this event, Arthur’s support did not need the changed discharge instructions. '+(result.path.id.startsWith('routine-')?'His approved routine and the way his home is set up were what mattered.':'The local support available today was what mattered.'),design:local+' Keep the care instructions ready for a time when a service needs them.'},
 enabled:{title:'Your earlier choices helped Arthur today.',now:c.inheritedCondition?.includes('portability')?'The service helping Arthur could use his shared medicine information, even though the plan copy was out of reach.':result.path.id==='outage-local-continuation'?'Arthur could use his checked daily instructions without the home internet.':'The service helping Arthur could use his checked care instructions. His next step could build on what was already known.',design:result.path.id==='outage-local-continuation'?'Give Arthur a clear, easy-to-find copy he can use offline.':'Make the right instructions easy to find and share, and give staff time to check them before care.'},
 constrained:{title:'Arthur’s next care team needs usable instructions.',now:checked?'His earlier instructions were checked, but the service helping him still needs a current copy it can use.':'A care professional needs to check Arthur’s changed instructions before the support that relies on them can go ahead.',design:'Design a simple way to share the latest plan, and make it clear who checks it and who Arthur can contact.'},
 repaired:{title:'The care team checked what Arthur needs now.',now:'The team reviewed and agreed the information needed for this step in Arthur’s recovery.',design:'Make room for a private conversation, a shared view of the plan and staff time to agree the next step.'},
 substituted:{title:'A fresh assessment gave Arthur a way forward.',now:'A care professional assessed Arthur again and gathered the information needed for today’s concern.',design:'Provide an easy way to reach the assessor, a comfortable place to talk and a clear follow-up for Arthur.'}
 }[c.effect];
 return {...content,foundation,effect:c.effect};
}
export function pairLearning(connection,titles={},result){
 if(!connection.interface)return {title:'Two kinds of support for Arthur',text:'Each choice adds its own help. For this event, they did not need to pass information or tasks between them.'};
 if(result&&!result.path.designIds.includes(connection.interface.to))return {title:'For another need · '+(titles[connection.interface.from]||'Home support')+' + '+(titles[connection.interface.to]||'Care support'),text:'These choices remain part of your design. Their connection was not used for Arthur’s next step in this event; it does not mean a visit or live review took place.'};
 const home=connection.interface.id==='homeEpisodeSetup';
 return {title:(titles[connection.interface.from]||'Home support')+' + '+(titles[connection.interface.to]||'Care support'),text:home?(connection.enabled?'Your home design provides a suitable place for the selected care visit. Staff, equipment and an agreed visit are still needed.':'These choices can work together once the home has a suitable place for this care visit. Staff and equipment still need arranging.'):(connection.enabled?'Arthur’s agreed movement information can help inform his recovery forecast. A care professional still reviews what it means.':'The forecast needs suitable movement information and Arthur’s agreement to share it before these choices can work together.')};
}
export function optionCarryForward(handoff,designId,choiceNames=[]){
 if(!['1A','1B','1C','4A','4B','4C'].includes(designId)||handoff.facts.verifiedTransitionPlan.state!=='established')return null;
 return {title:'A good start from Leave Well',text:(choiceNames.length?'You chose '+choiceNames.join(' and ')+'. ':'')+'Arthur has checked care instructions to share. When this support uses those instructions, his care team can build on them after checking they are still right for him.'};
}

export function supportUsed(result){
 const p=result.path;
 if(result.outcome==='EXPOSED')return {kind:'The help Arthur still needs',text:p.id==='outage-local-continuation'?'Arthur still needs usable local instructions and a safe way to complete or wait for the necessary task.':p.id.startsWith('routine-')?'Arthur still needs a workable setup and an agreed way to adjust his routine.':'Arthur still needs an agreed assessment with the right information and someone available to help.',design:'Check the missing support before relying on this next step. An app, a call and an in-person visit provide different kinds of help.'};
 if(p.id==='outage-local-continuation'){
  const digital=p.instructionSource==='funded-offline-essentials'||p.instructionSource==='funded-local-movement';
  return {kind:digital?'Digital help · works offline':'Physical help · routine and written instructions',text:p.localTaskMode==='robot-local'?'Arthur’s device can do its agreed task using its local controls.':p.localTaskMode==='self-alternative'?'Arthur can use an alternative way to do the task while the device is stopped.':p.localTaskMode==='safe-deferral'?'The device stays safely stopped, and the task can safely wait through the outage.':digital?'Arthur can follow the saved guidance on his device without the home internet.':'Arthur can follow his written instructions and use the ordinary features of his home. No live call or home visit is part of this result.',design:digital?'Make saved guidance easy to find, readable and available with charged equipment.':'Keep instructions within reach, controls easy to use and the space ready for the routine.'};
 }
 if(p.id==='routine-rehab-home'||p.id==='routine-supportive-home')return {kind:'Physical help · the home setup',text:'Arthur’s room and supports give him a usable place to follow his approved routine.',design:'Provide clear movement space, reachable controls and supports suited to the task.'};
 if(p.id==='routine-guided-movement')return {kind:'Digital help · movement guidance',text:'Arthur gets guidance for his approved movement routine through the selected devices.',design:'Position feedback where Arthur can use it while moving, with charging and a practical fallback.'};
 if(p.id==='routine-coaching')return {kind:'Virtual help · a human coach',text:'Arthur can talk with his agreed coach. The call supports his routine; it is not a home visit.',design:'Provide privacy, clear sound and a comfortable place to talk, with agreed coach availability.'};
 if(p.id==='home-assessment')return {kind:'Physical help · care in person at home',text:'The selected care service assesses Arthur at home when the required visit arrangements are in place.',design:'Allow room for Arthur, staff and the equipment needed for the visit.'};
 if(p.id==='home-transfer-fallback')return {kind:'Physical help · care at another setting',text:'The agreed alternative takes Arthur to a suitable care setting for assessment.',design:'Plan accessible departure, transport and a clear handoff to the receiving team.'};
 return {kind:'A connection to a care professional',text:'Arthur needs an assessment with a person. This result does not choose whether that happens by phone, video or in person.',design:'Arrange the right kind of appointment, a private place for a call if needed, and a clear next contact. An app can help connect him; it does not replace the assessor.'};
}
export const OPTION_HELP={
 '1A':['Digital help · app or voice guidance','Clear daily guidance Arthur can read or hear.'],
 '1B':['Physical + digital help','A home setup with reminders and controls where Arthur uses them.'],
 '1C':['Virtual help · human coaching','A person Arthur can talk to by phone or video, as arranged.'],
 '2A':['Digital guidance + physical devices','Movement feedback Arthur can use through selected devices.'],
 '2B':['Physical help · home adaptations','Space, fittings and supports that make daily movement easier.'],
 '2C':['Physical help · an assistive device','A device that helps with one agreed task, with local controls.'],
 '3A':['Physical device + digital readings','A wearable records selected changes for review.'],
 '3B':['Physical sensors + digital readings','Selected rooms provide agreed information about daily activity.'],
 '3C':['Digital help · a forecast','An app or display brings information together for people to review.'],
 '4A':['Connection to care · remote or in person','Helps Arthur reach a care professional; the right kind of assessment still needs arranging.'],
 '4B':['Physical help · care at home','A service brings people and the required equipment into Arthur’s home.'],
 '4C':['Virtual help · human navigation','A person helps Arthur organize his next steps by phone or video, as arranged.']
};
