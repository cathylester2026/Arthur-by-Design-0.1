# Arthur: By Design - causal alignment integration

No opening screens or slides are consolidated in this pass.

## Replace legacy behavior
1. Import `evaluatePortfolio`, `responseEligibility`, `strengthenCopy`, and `compareEvaluations` from `causalEngine.js`.
2. Replace `designEffects`, `designReliability`, and the aggregate body of `soloPortfolioEvaluation()` with `evaluatePortfolio(soloState, currentLeaveWellEvent().id, soloState.response || 'use')`.
3. In `soloPressure()`, call `responseEligibility()` for Adapt and Escalate. Display its `why` text and disable a response when `eligible` is false.
4. In `soloConsequence()`, show every `effects[].causal` explanation, including `blocked` prerequisites.
5. When Strengthen is selected, show `strengthenCopy(activation)` and keep `strengthened:true`; the engine adds the choice-specific readiness fields.
6. Preserve the existing event for revision. Evaluate the stored previous activations and revised activations, then render `compareEvaluations(before, after)` side by side.
7. Provide developer event override with `?event=route`, `?event=information`, or `?event=coordination`. Do not expose this control in normal play.

## Stable legacy aliases
Current keys remain valid and are translated canonically:
- ambient: bedside / shared / dedicated
- wayfinding: digital / layered / escort
- meds: nurse / pharmacy / huddle
- command: unit / center / liaison

This avoids breaking stored sessions while aligning consequence semantics to the 12 player-facing choices.
