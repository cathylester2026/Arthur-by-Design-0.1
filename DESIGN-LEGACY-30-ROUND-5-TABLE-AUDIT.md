# Arthur: By Design — 30-round, five-table simulated playtest

Date: 2026-11-23
Development branch: `feature/design-legacy-connected-chapters`
Test: `tests/designLegacyThirtyFacilitated.test.mjs`
GitHub Actions: https://github.com/cathylester2026/Arthur-by-Design-0.1/actions/runs/45256050900

## Scope and method

- 30 deterministic rounds, each with five tables of five simulated voters (150 complete table journeys, 750 **player participations**, not 750 independent journeys).
- Each table completed Leave Well, a stored chapter handoff, Recover Well, the recovery exit passport, and Live Well.
- Actual Leave, Recover and Live causal resolvers and state machines were used; Recover and Live saves were restored and verified.
- Each table was given an authored emphasis with a limited subset of preferred choices: clinical continuity, spatial access, digital-first, people/operations, balanced.
- Five simulated player ballots were cast for each shared table decision; the voting heuristic deliberately produced a three-vote majority before tallying. All vote statistics are artifacts of that rule, not measured human behavior.
- The scenarios and responses vary deterministically, but this is not random sampling of all legal portfolios, not multi-device facilitation, and not a measure of comprehension, discussion quality, or emotional impact.
- Leave Well composite outcomes were evaluated across route, information and coordination demands, whereas other chapters evaluate their own single authored disruption. Treat cross-chapter Holds percentages as different measures, not directly comparable success probabilities.

## All-table summary

| Metric | Result |
|---|---:|
| Simulation rounds | 30 |
| Table end-to-end journeys | 150 |
| Simulated participant-round participations | 750 |
| Simulated ballots | 7,875 |
| Simulated dissenting ballots | 2,632 (33.4%) |
| Leave Well HOLDS / STRAINED / EXPOSED | 0 / 46 / 104 |
| Recover Well HOLDS / STRAINED / EXPOSED | 105 / 10 / 35 |
| Live Well HOLDS / STRAINED / EXPOSED | 26 / 124 / 0 |
| Live Well verified clinical handoff burden reduction | 3 / 150 (2.0%) |
| Live Well with at least one funded but unused investment | 134 / 150 (89.3%) |

## By table (30 rounds each)

| Table strategy | Leave H/S/E | Recover H/S/E | Live H/S/E | Live participation | Live clinical carryover | Live funded-but-unused | Portfolio variety L/R/V |
|---|---|---|---|---:|---:|---:|---|
| 1 Clinical continuity | 0/0/30 | 20/3/7 | 4/26/0 | 4 | 3 | 28 | 4/6/6 |
| 2 Spatial access | 0/14/16 | 28/0/2 | 7/23/0 | 7 | 0 | 25 | 4/4/6 |
| 3 Digital-first | 0/0/30 | 20/2/8 | 8/22/0 | 8 | 0 | 27 | 8/6/6 |
| 4 People and operations | 0/21/9 | 23/2/5 | 4/26/0 | 4 | 0 | 25 | 6/4/4 |
| 5 Balanced | 0/11/19 | 14/3/13 | 3/27/0 | 3 | 0 | 29 | 8/8/8 |

`H/S/E` means Holds / Strained / Exposed. Each table simulated 150 participant-round participations and 1,575 ballots.

### Table 1 — Clinical continuity
- Complete Leave Well failure in this subset despite clinical investments. Only three Live Well cases used earlier clinical context to reduce repeated information work.
- The cross-chapter payoff exists but is too rare for most players to discover naturally.
- Clinical context may be repaired in Recover Well; the story needs to distinguish earlier verified data from paid/new reconciliation and show where that effort was incurred.

### Table 2 — Spatial access
- Strongest Recover Well results (28 of 30 Holds) and above-average Live Well participation (7 of 30).
- A home spatial intervention does not automatically solve community travel; it must be re-established in each environment.
- When prior design cannot support a later physical route, show that cause before players interpret the next chapter as arbitrary.

### Table 3 — Digital-first
- Highest Live Well success in this synthetic set (8 of 30), but Leave Well always Exposed; digital-first does not establish clinical ownership or coordination.
- This does **not** prove digital-first is the best strategy; authored scenarios, portfolios and vote selection can produce this result.
- Distinguish useful digital capability from an actual safe, accepted pathway.

### Table 4 — People and operations
- More Strained than Exposed in Leave Well (21 versus 9), Recover Well often Holds (23 of 30), but Live Well still rarely achieves participation (4).
- Human service investment has to be tied to qualified service acceptance and capacity in Live Well rather than merely reassuring prose.

### Table 5 — Balanced
- Widest portfolio diversity in Recover and Live (eight distinct portfolios each), but lowest Live Well participation (3 of 30) and the most unused Live Well purchases (29).
- Balanced purchasing does not necessarily produce a usable chain of dependent services. This is an important learning objective but can feel like punishment if not explained.
- Ask whether design options and scenario relevance are being shown clearly enough ahead of decision making.

## Cross-cutting diagnoses

1. **Success ranges are highly uneven and should be inspected before release.** The absence of any Leave Well Holds across a restricted portfolio sample suggests either demanding multi-demand thresholds, a limited ballot algorithm, or both. Do not label this a clinical/game logic defect without broader portfolio enumeration and baseline comparisons.
2. **Legacy's positive mechanical consequence is too sparse.** Only 3/150 Live Well journeys benefited from a verified/reconciled clinical handoff. More meaningful dependencies should be supported by actual operating facts, not invented bonuses.
3. **The unused-investment rate is extremely high.** At least one purchased Live Well design went unused in 134/150 runs. This can teach valuable causal restraint, but frequent no-payoff purchases risk making the game feel unresponsive or unfair.
4. **A Live Well Exposed result never appeared in this synthetic sample.** Diagnose whether the ordinary safe alternative or authored condition distributions are truncating outcome variety. This is a test-distribution signal, not proof that Exposed is unreachable.
5. **Facilitation itself remains untested.** All rounds made table-level scripted votes; no real people, cross-device synchronization, interruptions, task duration, phone readability, or group negotiation were measured.
6. **Dissent is artificially fixed by the vote generator.** Do not cite 2,632 dissenting ballots as a meaningful behavioral finding. Replace the forced three-person majority with realistic split/tie and four/five-person consensus distributions in the next run.
7. **Outcome meanings differ by chapter.** Leave's overall composite judgment must not be presented beside single-event Recover/Live results as though all three used the same success denominator.

## Recommended next development actions

- Audit each family's feasible options and response eligibility against its three disruption types; show participants where investment applicability and dependencies are known before they choose, without revealing the secret outcome.
- Model 30 additional rounds with varied consent/tie/consensus patterns and a wider set of legal portfolios, including optimal and ordinary baseline controls, to differentiate game difficulty from scripted strategy bias.
- Introduce credible, evidence-dependent advantages in subsequent chapters only for actual reusable foundations; leave capital and change separate.
- Preserve meaningful 'funded but unused' consequences, but tighten narrative explanations of why and provide accessible recovery/fallback alternatives.
- Run five actual *browser-controlled* full chapter journeys for desktop and 375/390px phones after balance revision. Confirm that the top of the map communicates what was enabled, what required repair, and what remains unsupported.
- Only then promote the draft Design Legacy pull request.

## Interpretation limits

Simulation proportions are not estimates of real participant behavior, learning, satisfaction, or workshop outcomes. Five table strategies were authored by the test and five synthetic players at each table cast votes by an algorithm biased toward a 3-person majority. No real Supabase workshop rows were inserted or modified.
