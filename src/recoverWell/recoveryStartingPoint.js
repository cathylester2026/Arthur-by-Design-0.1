// Player-facing summary only. Availability is still checked by the recovery rules.
export function startingPoint(handoff, capabilityId) {
 const state=handoff.facts.verifiedTransitionPlan.state,verified=state==='established';
 const foundation=verified?'Arthur has a checked care plan to share when he needs help.':state==='open'?'Arthur can ask for help at home. His changed care instructions still need checking.':'Arthur can ask for help at home. His care team will need to check his latest instructions.';
 const needs={
 personalized:'Make Arthur’s day easier to follow, with clear reminders or a coach he can talk to. This works best with up-to-date care instructions.',
 rehab:'Help Arthur move and manage everyday tasks at home. He needs an approved routine and enough room or the right support to do it safely.',
 warning:'Help Arthur and his care team notice changes sooner. Choose what to measure and who will respond when something needs attention.',
 response:verified?'Arthur can share his checked plan with the service helping him. That service still needs to have someone available and agree to take care of him.':'Arthur can ask for a fresh assessment. A qualified care professional can check what has changed and work out the next step.'
 };
 return {state,foundation,now:needs[capabilityId]||'Choose the support Arthur will have at home: clear daily guidance, help with movement, ways to notice change, or a connection to care.',consequence:verified?'His next care team can build on those instructions, once they check that they are still right for him. Now choose how his home and support will help him recover.':'A qualified care professional can check the instructions or assess Arthur again. Support that relies on the changed instructions needs that check first.'};
}
