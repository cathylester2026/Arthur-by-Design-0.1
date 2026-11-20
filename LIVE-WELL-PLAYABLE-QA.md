# Arthur: By Design — Live Well playable release acceptance

## Status
This branch implements a complete, playable Live Well chapter. The final integration and browser workflows are release gates; merge only after the latest commit passes all three workflows.

## Experience
- Consistent Arthur imagery taken from existing original `public/assets/arthur-live-well.png`.
- Invitation to a neighborhood gathering; investment family; three design choices per family; Strengthen or Extend; disruption; response; Arthur's outcome; Three Futures; two-screen three-chapter ending.
- Responsive cards paged on phone, with Capital / Change continually visible.
- Reading view and optional facilitator discussion pauses.
- Clear separate starting condition for standalone play and validated completed Recover Well exit passport for connected play.
- Three disruptions selected deterministically from run identity, independently of investments.
- Local run save, strict replay validation and preservation of prior completed runs in a `:completed` archive. Replay starts a new independent round.
- Connected journey menu displays Live Well completion and outcome; participant returns to the same browser-local lineage.

## Scope and honest boundaries
- Facilitator display is a shared-room discussion aid, not synchronized cross-device group voting.
- Connected continuation uses browser-local record; it is not server-authenticated.
- No implied ongoing care enrollment, clinical authority, accessible transport or available community staff.
- Flexible Participation Support (4A) requires actual accepted staff, accessible space and appropriate care evaluation; Autonomous Delivery is no longer in the catalogue.
- The Three Futures classify one scenario only; they are not a definitive community-wide readiness score.

## Validation
- `npm test` includes 56+ automated source tests including 66 portfolio coverage, 14 authored scenario conditions × response matrices, clinical guardrails, replay/tamper protection and scenario distribution.
- `npm run build` for production packaging.
- `scripts/live-well-browser-acceptance.mjs`: desktop standalone, 390px Extend, 375px Strengthen, facilitator view, saved/reloaded page, replay/archive, and complete connected Leave → Recover → Live flow.
- `scripts/recover-well-browser-acceptance.mjs` retained to detect regression in the first two connected chapters.
- Browser-generated full-page screenshots available as workflow artifacts for manual inspection.

## Short remaining checklist
- Confirm deployment to GitHub Pages when merged, with new and connected Live Well URLs loading.
- Rehearse a real group with multiple phones; synchronization for later chapters is not included.
