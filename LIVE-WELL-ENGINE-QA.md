# Live Well causal engine — working v0.1

## Status
Engine and source-level integration tests implemented on `feature/live-well-causal-engine`. No Live Well player UI, save/resume workflow or released live chapter yet. Leave Well and Recover Well are untouched. This is a gameplay logic foundation for the final chapter.

## Arthur's objective
Arthur wants to rejoin a neighborhood gathering. His goal includes **participation, agency and manageable burden**, not merely receiving care or owning more technology.

## Investments
Four families, 12 A/B/C design commitments in `src/liveWell/liveCatalogue.json`:
- Smart Community Mobility: AI Journey Guide, Connected Streetscape, Mobility Network — **3 Capital, 2 Change**.
- Care Without Walls: Community Care Pod, Distributed Care Network, Mobile Care Services — **3 Capital, 3 Change**.
- Adaptive Wellness & Independence: Adaptive Walking Coach, Personal Health Companion, Connected Participation — **2 Capital, 2 Change**.
- Intelligent Community Services: Flexible Participation Support, Connected Community Hub, Community Concierge — **3 Capital, 2 Change**.

Fresh Live Well chapter allocation: **7 Capital + 6 Change**. Strengthen costs **1 Capital + 1 Change**, or Extend adds one different family. The original chapter budgets are retained as historical evidence, not quietly rolled forward.

## Disruptions
- **S1 Route closure** — choose verified physically accessible detour, truly accepted accessible ride, or safe deferral.
- **S2 Unusual fatigue** — safe pause, qualified accepted timely clinical advice when indicated, and separately established ability/opportunity to resume participation.
- **S3 Venue relocation** — confirmed venue and usable travel, or a participation alternative Arthur actually accepts.

## Responses and costs
- **Use:** 0/0, only uses actually demonstrated investment functions.
- **Adapt:** 0/1, improves outcome only when an alternate route, participation mode or approved adjustment is actually verified.
- **Coordinate:** 1/1, helps only when transport, clinical assessment or venue coordination is actually accepted and capacity exists.
- **Ordinary:** 0/0, preserves a reachable, explainable alternative even when no purchased design succeeds.

The engine never infers that AI creates accessible sidewalks, staffed transport, clinicians, event arrangements or clinical authority. The flexible participation card can support a shorter or adapted event only when a real accessible setting and accepted staff support exist; it cannot replace clinical assessment or automatically clear Arthur to continue.

## Three Futures
These are **event-scoped** outcomes, not a rating for the whole community:
- `FRAGMENTED` — missing essential support or high unrecovered coordination burden.
- `CONNECTED_FRAGILE` — some response is usable but independence or burden still limits the experience.
- `ADAPTABLE_ACCOUNTABLE` — event participation is actually achieved with meaningful agency and manageable burden.

Clinical safety is evaluated independently of participation. Qualified advice may be accepted even when attending the gathering is inappropriate. Result records carry outcome `HOLDS | STRAINED | EXPOSED`, participation, agency, burden, route and the realized (not merely purchased) Strengthen contribution.

## Continuity
`makeLiveStart({recoveryPassport})` accepts a validated-format Recover Well `rw.exit.v1` passport and preserves source run ID, prior outcome and unresolved gaps. New community eligibility, clinician service acceptance and monitoring remain **unknown** until Live Well establishes them. Standalone play explicitly reports authored starting conditions.

## QA and limitations
Automated suite enumerates **66 legal portfolios × 3 disruptions × 4 responses = 792 default affordable response cases**, plus hostile missing-service facts and direct clinical/route/event guardrail tests.

The default scenario matrix is intentionally demanding: **63 HOLDS / 729 STRAINED / 0 EXPOSED**. EXPOSED is reachable and tested when qualified advice is not established in S2. This is a baseline matrix, not a gameplay balance target. Most default candidates lack verified acceptance or capacity; diversify scenario variants and observed outcome distribution before releasing a player-facing game.

Not yet delivered:
- Live Well phone UI and facilitator screens.
- Persistent run action history, save/restore and signed connected chapter completion.
- Real-browser desktop/phone acceptance.
- Narrative copy and investment artwork reviews.
- Balance targets for the mix of Three Futures within realistic scenario variants.

Keep Live Well separate from production until those are built and accepted.

## Investment catalogue update — 4A
Autonomous Delivery has been replaced with **Flexible Participation Support**. This directly influences Arthur's participation through accessible rest, shortened activity formats and staffed human flexibility, while remaining dependent on physical access, qualified advice in S2, available staff, and a confirmed gathering in S3. The original 7 Capital / 6 Change and all four family costs stay unchanged. Earlier matrix totals in this document predate the replacement and should not be treated as current; see the latest workflow balance report.
