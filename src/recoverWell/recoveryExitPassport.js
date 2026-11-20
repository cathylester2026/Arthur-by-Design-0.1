// Portable evidence for a future Live Well chapter. It is intentionally a snapshot
// of what this Recover Well run established, not an inferred community-care entitlement.
export function recoveryExitPassport(run) {
 if(!run?.result||!run?.runId)throw Error('A completed Recover Well result is required.');
 const result=run.result;
 const portfolio=(run.investments||[]).map(i=>({designId:i.designId,strengthened:!!i.strengthened}));
 const livePath=result.path||{};
 return {
  schema:'rw.exit.v1',
  source:{chapter:'recover-well',runId:run.runId,leaveWellRunId:run.handoff?.source?.runId||null,scenarioId:run.scenarioId},
  decisions:{portfolio,strategy:run.strategy,response:run.response},
  resourcesRemaining:{capital:run.capital,change:run.change},
  established:{outcome:result.outcome,pathId:livePath.id||null,respondingService:livePath.actor||null,scope:livePath.scope||null,usedCapabilityIds:[...(livePath.designIds||[])],priorClinicalContextUsable:result.inheritance?.priorContextUsable===true,contextReconciledInRecovery:result.inheritance?.recoveryReconciliationUsed===true},
  dependencies:{unresolved:[...(livePath.gaps||[])],additionalBurden:(result.burdenEvidence||[]).map(b=>b.detail),nextStepEstablished:result.outcome!=='EXPOSED',continuingCommunityServiceAccepted:null,ongoingMonitoringOwnerConfirmed:null},
  guardrail:'This is evidence from one recovery event. It does not establish a surveillance service, home eligibility, or capacity for future care.'
 };
}
