// Arthur's recovery ending: one patient, a truthful result, and a portable learning record.
// This module never modifies clinical resolution, resource charges, or Leave Well history.
export function recoveryChapterClosing(run) {
  if (!run?.result) throw new Error('A resolved recovery result is required.');
  const r=run.result;
  const path=r.path||{};
  const chosen=(run.investments||[]).map(i=>i.designId);
  const used=path.designIds||[];
  const unused=chosen.filter(id=>!used.includes(id));
  const handoff=r.inheritance||{};
  const clinical=!String(path.id||'').startsWith('routine-')&&path.id!=='outage-local-continuation';
  const assessed=clinical&&r.outcome!=='EXPOSED';
  const status=r.outcome==='HOLDS'?'Arthur has an established next step.':r.outcome==='STRAINED'?'Arthur has a next step, with additional coordination needed.':'Arthur still needs an essential part of his response arranged.';
  const experience=r.outcome==='EXPOSED'
    ?'Arthur knows he needs help, but the pathway used in this event has not established every required step. Do not assume the concern is resolved.'
    :clinical
      ?'Arthur reaches an accepted, qualified assessment for this concern. That does not by itself mean he can remain at home.'
      :path.id==='outage-local-continuation'
        ?'Arthur has a supported way to manage the specific task during the connection outage, using the available local route, alternative or safe deferral.'
        :'Arthur can adjust the identified routine within the limits already agreed with his care team.';
  const route=r.outcome==='EXPOSED'
    ?used.length?'Arthur attempted a pathway involving a funded capability, but a required response dependency remains missing.':'The attempted response has not established every required step; no funded capability is credited with a completed response.'
    :used.length
      ?'A funded capability contributed to the established pathway Arthur used.'
      :'Arthur used an ordinary pathway rather than one of the capabilities purchased in this session.';
  const difference=unused.length
    ?'Other selected capabilities still have value for different recovery needs, but were not required for this event.'
    :'The selected support was relevant to this event; it still depends on the people, information and conditions actually available.';
  const prior=handoff.recoveryReconciliationUsed
    ?'A qualified team reconciled missing information for today. This did not retroactively change the hospital discharge record.'
    :handoff.freshAssessmentContextUsed
      ?'A fresh qualified assessment established the context needed today. The original discharge record is unchanged.'
      :handoff.priorContextUsable
        ?'Useful information established at discharge was available to support today’s response.'
        :'A usable discharge plan was not established as a dependency of the path used today, or its information was not available to the receiving service.';
  const next=r.outcome==='EXPOSED'
    ?'Arrange the specific missing link named in the result with an accountable service; Arthur cannot rely on an unconfirmed response.'
    :r.outcome==='STRAINED'
      ?'Keep the accepted next step, and assign ownership of the extra handoff or workaround recorded in this result.'
      :assessed
        ?'Follow the qualified care professional’s accepted next-step plan and confirm who owns follow-up.'
        :'Continue the approved routine or local fallback; contact the care team if Arthur’s condition or needs change.';
  return Object.freeze({status,experience,route,difference,prior,next,outcome:r.outcome,used:used.slice(),unused});
}
