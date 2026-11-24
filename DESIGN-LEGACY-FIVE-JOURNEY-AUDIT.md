# Design Legacy — Five complete three-chapter simulation audit

Date: 2026-11-23
Branch: `feature/design-legacy-connected-chapters`
Evidence: `tests/designLegacyFiveEndToEnds.test.mjs` at commit `0eb4463898075cb7035059668c4ded42bf94cefd`. CI job: https://github.com/cathylester2026/Arthur-by-Design-0.1/actions/runs/45249104420

## Scope / important distinction

Five deterministic **model and state-machine** simulations used the actual Leave Well causal evaluator, the real validated Leave → Recover handoff, actual Recover Well action transitions and result, the recovery exit passport, and the actual Live Well state machine and evaluator. Every run reached Live Well's `finale`, including serialized and restored Recover and Live records.

These were **not five fully clicked browser sessions**. The separate Live Well browser and mobile chapter acceptance workflows passed on the prior relevant branch commit; they do not constitute a five-person usability study.

## Raw outcomes

| Journey | Leave result / plan | Recovery result / path | Recovery context | Live result / route | Legacy | Live future |
|---|---|---|---|---|---|---|
| 1 Strong information | EXPOSED / established | HOLDS / routed-assessment | usable verified context | HOLDS / context-supported-assessment | enabled, burden -1 | Adaptable and accountable |
| 2 Reconstructed context | STRAINED / open | HOLDS / routed-assessment | reconciled in recovery | HOLDS / context-supported-assessment | enabled, burden -1 | Adaptable and accountable |
| 3 Technology outage | EXPOSED / open | HOLDS / outage-local-continuation | not established | STRAINED / ordinary-delay-or-return | not used | Fragmented |
| 4 Ordinary human care | EXPOSED / open | STRAINED / explicit-ordinary-assessment | not established | STRAINED / ordinary-qualified-assessment | not used | Fragmented |
| 5 Spatial and community | STRAINED / open | HOLDS / routine-supportive-home | not established | HOLDS / built-detour | not used | Adaptable and accountable |

## Key observations

1. **A chapter overall EXPOSED result can coexist with an established *specific* plan fact.** Journey 1 had a verified transition plan even though other Leave Well demand-level gaps left the composite hospital result EXPOSED. This is valid under the current scoped evidence model, but the interface must clearly communicate both the established capability and unresolved other gaps, or players will perceive contradiction.
2. **Repair is not history rewriting.** Journey 2 began with an open plan, then reconciled current context in Recover Well. Live Well's benefit is based on that new qualified context, not a retroactive improvement to Leave Well.
3. **Investment does not guarantee realization.** Journey 3 purchased an AI Journey Guide, but the actual detour conditions did not support a usable route. It fell back to an ordinary deferral. The recovery robot did not invent mobility or transport.
4. **Unfunded ordinary pathways matter.** Journey 4 chose ordinary assessment rather than automatically crediting the funded recovery route; the Live Well ordinary pathway did not deliver event participation.
5. **Environment-specific investments are independent.** Journey 5's recovery-supportive home and Live Well accessible streetscape each contributed within their own physical setting. Hospital wayfinding did not automatically create accessibility at home or in the community.

## Important gaps before product release

- **The contextual distinctions are stronger than the cross-chapter mechanical consequences.** Journeys 1 and 2 both receive a one-unit handoff-burden reduction in Live Well after recovery establishes usable context. The difference — prior confirmation vs later reconstruction — is present in records, but not yet strong enough in on-screen narrative.
- **Only one narrowly scoped Live Well causal benefit exists.** Verified context affects handoff effort within an accepted qualified assessment; other family readiness indicators are informational. They do not alter cost, eligibility or realized outcome. Do not claim a comprehensive twelve-design mechanical dependency matrix.
- **Visual outcome explanation needs scrutiny.** The journey map lists established state but does not yet show a clear before/after comparison of what an earlier investment specifically saved Arthur from doing.
- **Budget portability is intentionally off.** Each chapter begins at 7 Capital / 6 Change; unspent Recovery Well resources (3/2, 3/1, 3/3, 3/2, 3/3 across runs) do not transfer to Live Well. Established evidence does.
- **Save compatibility must remain protected.** Prior Live Well saves without the new legacy policy replay under their original rules.
- **Browser task remains.** Run five *actual clicked* UI paths on desktop and 375/390px phones to assess readability, stepwise transition, accessible behavior and visual composition. Passing engine and isolated browser acceptance tests does not replace this.

## Release advice

Keep the PR in review until the intended cross-chapter narrative and mechanical scope are explicitly accepted. Preserve the scope guardrail: do not invent clinician availability, service acceptance, transportation, staffing, clinical clearance, or community infrastructure.
