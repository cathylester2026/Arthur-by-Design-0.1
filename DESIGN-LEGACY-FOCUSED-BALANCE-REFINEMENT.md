# Focused Balance and Dependency Refinement — November 24, 2026

## Decision
Refine the *truthfulness and visibility* of consequences, not artificially raise player scores. Keep chapter resources distinct (7 Capital, 6 Change), and retain real service acceptance, qualification, physical access and safety prerequisites.

## Changes (new connected Live Well runs)
1. **Scope cues before investing:** All 12 designs now disclose which disruptions they can plausibly help with (route change, health concern, venue change). The disruption reveal explicitly names funded designs in and out of scope, without giving away actual operational conditions before the event.
2. **Independent fallback:** Under a new versioned Live Well policy, an Extend portfolio can reduce burden by one when *two distinct funded and genuinely usable* responses exist for the same disruption. Buying two cards by itself earns nothing.
3. **Ordinary qualified-care continuity:** An existing accepted, timely qualified care pathway can use previously verified/reconciled, currently usable clinical information to reduce one unit of repeated handoff work. This does not credit purchased technology, allow participation, or imply clinical safety without current assessment.
4. **Preserve saved sessions:** Previously recorded connected runs with the prior policy are replayed by their original rules, including their original result object shape.

## Comparison against the previous 30-round simulation

| Metric | Before | After |
|---|---:|---:|
| Complete table journeys | 150 | 150 |
| Leave Well Holds / Strained / Exposed | 0 / 46 / 104 | 0 / 46 / 104 |
| Recover Well Holds / Strained / Exposed | 105 / 10 / 35 | 105 / 10 / 35 |
| Live Well Holds / Strained / Exposed | 26 / 124 / 0 | 26 / 124 / 0 |
| Live Well validated clinical handoff benefit | 3 | 3 |
| Live Well with usable secondary fallback | Not separately credited | 4 |
| Live Well runs with at least one funded-but-unused design | 134 | 130 |
| Ordinary accepted care using previous context | Not credited | 0 within this fixed synthetic sample |

The numbers are from the same deterministic 30-round, five-table, five-voter-per-table simulation. Because the sample contains no matching ordinary-care/context combination, the new ordinary-care rule is verified separately with positive and negative causal regression tests, not claimed as a benefit seen in those 150 simulated table journeys. All three chapter outcome distributions remain unchanged in this sample. Thus this is a bounded *dependency and explanation refinement*, **not an empirical rebalance of difficulty**.

## What the results mean
- The new fallback credit reduced the count of Live Well journeys with unused investments by four (134 → 130); the improvement is modest and justified by actual independent route evidence.
- The dramatic variance in Leave Well vs Live Well success remains. Those chapters use different outcome definitions (composite three-demand readiness vs single-event response), and the simulated ballot generator has a restricted portfolio menu and scripted majority. Do not tune outcome odds to these numbers alone.
- The game now exposes a known mismatch *before* the player chooses: investments differ in the disruption types they can address. Seeing a technology fail outside its domain can be a useful lesson, but repeated purchases without payoff need a readable explanation.
- The next meaningful test is **actual players** making decisions with the new relevance descriptions, not another forced-majority simulation.

## Acceptance guardrails
- No automatic cross-chapter funds carryover.
- No made-up accepted clinical service, monitoring owner, accessible vehicle, accessible venue, clinician capacity or clinical clearance.
- A second independently usable route can reduce burden but cannot make an unsafe or impossible outcome safe.
- Ordinary qualified care keeps the route uncredited to a purchased technology.
- Older browser-local replay records must remain valid.

References:
- `tests/designLegacy.test.mjs`
- `tests/designLegacyThirtyFacilitated.test.mjs`
- `tests/liveWellBalance.test.mjs`
- `scripts/live-well-browser-acceptance.mjs`

This audit covers engine-level and existing browser-acceptance instrumentation; it does not report a human usability study.
