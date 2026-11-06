# Medication reveal timing + layout fix

Replace root files:
- main.js
- medicationInvestmentTransition.js
- medicationInvestmentTransition.css
- medicationDesignReveals.js
- medicationDesignReveals.css

Assets are included for completeness and may overwrite existing copies.

## Changes in this build
- Before hold increased from 1.6s to 2.8s.
- Crossfade increased from 0.65s to 1.2s.
- After state holds for 1.0s before the impact content appears.
- Total automatic reveal is about 5 seconds, plus player-controlled reading time.
- Skip Animation remains available.
- Fixed need-status strip layout rather than relying on missing generic styles.
- Restored proper white cards, pills, spacing, Learn More, Design Insight, and full-width CTA.
- Removed explicit fast-timing values from main.js so reveal module defaults control timing.

No scoring, resource, state, decision ID, navigation destination, multiplayer, event, or causal logic changes.
