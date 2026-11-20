# Recover Well: connected journey and rules QA
**Date:** 2026-11-20  
**Branch:** `feature/recover-well-arthur-continuity` (draft PR #4)  
**Scope:** Automated source-level game-engine and bridge testing, *not* browser-controlled playthroughs.

## Results
| Suite | Coverage | Result |
|---|---|---|
| Connected 50-journey campaign | 50 seeded Leave Well evaluations and validated handoffs, 25 Strengthen / 25 Extend, 34 unique recovery portfolios, 17 S1 / 17 S2 / 16 S3, save and resume, chapter completion | 50/50 completed |
| Exhaustive default rules matrix | 66 legal recovery portfolios × 3 disruptions × 2 authored discharge-plan starting conditions | 396/396 with valid response options |
| Response matrix | All eligible and affordable responses across the above cases | 991 evaluated |
| Adversarial tests | Low budget, missing qualified service acceptance/capacity, replay tampering, repeated event IDs, robot fallback | Passed |
| Existing and added test files | Unit, bridge, regression, safety and continuity suites | 25/25 tests passed |
| Production bundle | `npm run build` on GitHub Actions | Passed |

## Distribution from the 50 connected journeys
- Recovery outcomes: **HOLDS 36**, **STRAINED 7**, **EXPOSED 7**. All reached chapter completion.
- Responses actually chosen: **Use 21**, **Ordinary 23**, **Adapt 5**, **Escalate 1**.
- Selected investment strategy: **Strengthen 25**, **Extend 25**.
- Source provenance: Leave Well portfolio was evaluated by the actual `causalEngine.evaluatePortfolio` and passed to `connectLeaveWell`; recovery was executed through `applyRecoveryAction` and restored through `recoveryProgress`. This is engine-level integration, not simulated clicks through the rendered UI.

## Defect corrected during testing
- **Strengthened Robotic Assistance**, when the actual six-hour outage uses the prepared safe-deferral route, previously succeeded but did not record a realized strengthening contribution.
- Added a scoped `2C` attribution in `recoveryResolver.js` requiring the completed selected outage route and both `robotSafeStop` and `safeTaskDeferral` scenario predicates. Added a regression assertion.

## Findings / limits
1. **No blocking progression, negative budget, missing response, invalid replay acceptance, or falsely resolved clinical acceptance** found in tested legal cases.
2. A legitimate **EXPOSED** result is not a dead end. Players can learn from and complete the chapter.
3. Adapt and Escalate are deliberately less common: no additional effect/benefit disables those actions. A future playability decision may investigate whether their limited availability is satisfying to a player; do not enable them without actual causal benefit.
4. This matrix covers all **legal portfolios under default** disruption facts and both standalone plan contexts. It is not exhaustive over all Boolean scenario overrides, every possible Leave Well configuration, or every prior historical version.
5. **Manual desktop/mobile interface regression is still outstanding.** Automated tests do not prove visual navigation, layout, accessibility, or every link in the deployed site.
6. Keep `main` and the live GitHub Pages game unchanged until interface acceptance and PR review.

## Relevant automated tests
- `tests/recoveryCampaign50.test.mjs`
- `tests/connectedFiveJourneys.test.mjs`
- `tests/recoverySafetyStress.test.mjs`
- `tests/recoveryBalance.test.mjs`
- `tests/recoverySavedRunCompat.test.mjs`
- `tests/recoveryChapterClosing.test.mjs`
- `tests/recoveryExitPassport.test.mjs`
