# Live Well — chapter foundation (working design, not yet implemented)

## Status and boundary
Leave Well and Recover Well are the accepted first two chapters. Live Well will be an independent, complete community-life story *and* the natural third chapter of Arthur's connected journey. This file sets an initial design boundary only; no Live Well engine, UI, or rules are created here.

## Central player question
Arthur is no longer defined simply by a safe discharge or a recovery event. Can he live the life he wants—moving through his community, attending appointments and activities, staying connected, and having meaningful choices—when access, systems, and support do not behave as planned?

## Arthur continuity
- **Use only existing original Arthur images/assets**. Do not generate or replace Arthur; new environments may surround the same character.
- Arthur's transition must be legible: what went well in Leave Well, which recovery condition and investments actually held, and what remains unresolved or burdensome.
- Chapter 3 must still work on its own with a clearly labeled *authored starting condition*, never a fabricated prior play result.

## Source-of-truth continuity interface
Import the validated completed recovery run through `journeyBridge.recoveryProgress(entry)` and derive `recoveryExitPassport(run)`.
- Carry source `leaveWellRunId`, Recover Well `runId`, the actual prior choices, `resourcesRemaining`, used recovery designs, outcome, unresolved gaps, and recorded burden.
- **Never infer** a continuing community service, live monitoring owner, transport, available capacity, clinical acceptance, or qualification merely from a prior chapter. These are explicitly null or unknown until established in Live Well.
- Original Leave Well / Recover Well evaluation and balances remain immutable. Live Well allocates its own decisions and checks scoped facts separately.
- If the participant starts in Live Well directly, label and preserve the authored starting condition.

## Three futures (provisional player-facing design)
Present the *same Arthur goal and same disruption* through three plausible operating futures, distinguished by built-environment / service / AI readiness rather than an artificially ranked technology ladder.
1. **Fragmented continuity** — Arthur receives useful information but must bridge access, identity, appointments, and services himself. Physical and digital barriers are visible.
2. **Connected but fragile** — multiple services and AI guidance are nominally linked, but one unmet dependency (data quality, coverage, public space, consent, connectivity, ownership, accessibility) can expose the experience.
3. **Adaptable, accountable continuity** — built places, services, trusted information and human fallbacks support a resilient community life; limitations and tradeoffs remain visible.

These are hypotheses for design review, not final player outcomes or a preassigned best path. The player's decisions should meaningfully influence which future unfolds.

## Proposed complete chapter arc
1. **Arthur's purpose:** a concrete, human reason to get back into everyday life; not a technology shopping list.
2. **Community moment:** visit, social activity, or independent errand that requires multiple environments and transitions.
3. **Investment:** choose where design can change Arthur's options; preserve Capital/Change tension and distinguish purchase from actual readiness.
4. **Design commitment:** make the capability useful, resilient and human, explicitly involving spaces, people, services and AI.
5. **Disruption:** one meaningful community-life constraint tests the selected portfolio.
6. **Response and consequence:** assess Arthur's goal, actual experience, dependencies, new effort and whether agency/participation are preserved. HOLDS/STRAINED/EXPOSED may be reused only if their scoped definitions fit; clinical safety claims stay separate.
7. **Standalone ending:** Arthur's community-life story reaches a complete, emotionally legible conclusion even if unresolved dependencies remain.
8. **Connected ending:** reveal the cumulative architecture and operational decisions made from hospital to home to community, with one clear design takeaway.

## Learning and quality gates
- Choices must cause visible differences without adding fake service capacity or granting AI clinical authority.
- Each investment should have a credible contribution and an operating/architectural obligation; Strengthen and Extend must have differentiated effects.
- Show the *three futures* through one understandable comparison; don't make users read three long text blocks.
- Mobile-friendly, visually driven, low reading load, controlled story pacing. Use same consistent Arthur.
- Dedicated automated portfolio/scenario matrix, connected Save/Resume tests, and browser-driven desktop/mobile acceptance before merging.

## Pending Live Well design decisions
- Choose Arthur's single emotionally resonant community-life mission.
- Define the exact community environments/services and constraints, then the 3–4 investment families.
- Resolve whether three futures are alternate scenario reveals, a comparison at the end, or both.
- Decide starting resources: do not silently reuse Recover Well's remaining Capital/Change as a new chapter budget; if carryover restricts Live Well, show that rule explicitly.
