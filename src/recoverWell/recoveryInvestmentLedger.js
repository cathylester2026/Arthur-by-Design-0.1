// Event-scoped investment attribution. Never equates a purchase with clinical readiness.
// A capability may remain valuable outside this particular disruption.
export function recoveryInvestmentLedger(investments,result,baseline=null) {
 if(!Array.isArray(investments)||!result?.path||!Array.isArray(result.consideredPaths))
   throw new Error('Investment ledger requires a complete recovery result.');
 const chosen=result.path;
 return investments.map(investment=>{
  const id=investment.designId;
  // Include the pre-response funded pathway: ordinary care may be chosen even when a purchased route was available.
  const paths=[...result.consideredPaths,...(baseline?.consideredPaths||[])];
  const applicable=paths.filter(p=>p.designIds?.includes(id));
  const ready=applicable.some(p=>p.complete);
  const involved=chosen.designIds?.includes(id)===true;
  const used=involved&&chosen.complete;
  const attempt=involved&&!chosen.complete;
  const status=used?'USED IN THIS RESPONSE':attempt?'RESPONSE DEPENDENCY MISSING':ready?'AVAILABLE, NOT USED':applicable.length?'NOT READY FOR THIS EVENT':'NOT TESTED BY THIS EVENT';
  const consequence=used
   ?'This investment contributed to the established pathway Arthur used.'
   :attempt
    ?'The chosen route depended on this investment, but it did not establish every required step.'
    :ready
     ?'A viable pathway using this investment was available, but another route was selected.'
     :applicable.length
      ?'The event tested this investment, but the needed task, service, context or fallback was not established.'
      :'This disruption did not require this capability. Its value for other recovery needs is not scored here.';
  return {designId:id,purchased:true,strengthened:investment.strengthened===true,readyForEvent:ready,used,attempted:attempt,status,consequence};
 });
}
