# Live Well — balance pass v0.2

## What changed
- Created **14 authored, reproducible, factual community conditions** in `src/liveWell/liveBalance.js`. Each scenario reveals actual external circumstances (verified detour, accepted care, accessible staffed venue, genuine unavailable service), not arbitrary scoring.
- Defined **10 routine scenarios**, **1 challenge** (qualified advice succeeds but attending is inappropriate), and **3 intentionally unwinnable stress cases**. Stress cases remain available to automated tests and facilitator-led discussion but are excluded from ordinary random play.
- Added seeded `selectPlayProfile(scenarioId,seed)`; its selection is independent of the player's purchases and intended outcome. The actual condition and consequences must still be revealed to the player.
- Made **Strengthen a realized advantage** when justified by functioning capacity or verified readiness: more dependable guidance, reduced coordination/effort burden, or a tested fallback. It does not create an accessible route, clinician, staff, vehicle or venue.
- Calibrated **Adaptable and Accountable** to permit meaningful participation with up to two points of measured burden, rather than requiring near-perfect frictionless travel. Agency must be high, safety established, and participation real.
- Preserved independent measures of clinical safety, Arthur's participation, agency, burden and responsible service acceptance. A qualified medical decision not to attend is not misclassified as permission to resume activity.

## Test coverage and results
- **66 legal portfolios × 14 conditions × 4 affordable responses = 3,696** engine-level evaluations.
- **All 12 designs** have at least one genuinely demonstrated, scoped route or contribution.
- Separate Strong vs. Extend comparisons for **all 12 designs** require an observable incremental benefit and honest strength attribution.
- Original 792 default-scenario response matrix remains covered by the existing regression suite.
- Default all-combination results from 14 authored conditions (not a forecast of player outcomes): **639 HOLDS / 2,793 STRAINED / 264 EXPOSED**. Normalized futures: **415 ADAPTABLE_ACCOUNTABLE / 287 CONNECTED_FRAGILE / 2,994 FRAGMENTED**.
- For the **11 player-eligible conditions**, selecting the best available response for each of the 66 legal portfolios yields **225 HOLDS / 501 STRAINED** across 726 evaluated combinations. That is **31.0% HOLDS**, a measure of theoretical legal strategy coverage, not an observed win rate or prediction of human choices.
- Strengthen: 26/132 possible player-condition portfolios reached HOLDS; Extend: 199/594. Do not compare raw counts without normalizing: Extend has 54 possible portfolios, Strengthen 12. Stronger single investments demonstrably reduce burden or unlock a real backup where relevant.

## What the findings mean
- A random irrelevant portfolio should not automatically succeed, even when a service exists. A credible favorable condition is an opportunity, **not a promise of success**.
- Each routine profile is *attainable by at least one legal portfolio*. Three stress-only cases are not and must never be rolled into ordinary random play without explicit warning.
- **Autonomous Delivery (4A) is supporting**, not a guaranteed way to attend the gathering: it can remove a necessary errand/effort when an actual delivery and appropriate plan are established, but it does not resolve unfamiliar clinical symptoms, inaccessible streets or missing venue acceptance. This limitation must be visible on the card; later story design may add a dedicated essentials/delivery activity where it becomes a primary solution.
- No card is universally optimal. Results still depend on physical infrastructure, accepted qualified services, accessible participation and accountable human operations.
- The stress matrix is deliberately weighted toward irrelevant investments and the ordinary response, so it is **not** an estimate of audience enjoyment. Next stage should evaluate meaningful player strategy selection and scenario readability on phone devices.

## Outstanding before release
Live Well remains **an engine, not a playable chapter**. Build player run state, save/restore and connected journey route; mobile-first card screens, scenario/facilitator reveals, accessible imagery using the same Arthur; then run actual 375/390 px browser and multi-device workshop rehearsals. Do not merge this development branch into the live game until that acceptance is complete.
