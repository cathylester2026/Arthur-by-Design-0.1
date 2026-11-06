# Medication clean-image + persistent-design visual fix v6

## Replace at repository root
- main.js
- medicationInvestmentTransition.js
- medicationInvestmentTransition.css
- medicationDesignReveals.js
- medicationDesignReveals.css

## Add at repository root
- medicationPortfolioVisual.js
- medicationPortfolioVisual.css

## Replace in assets/
- medication-check-before.png
- medication-check-activated.png
- design-meds-ai-check-first.png
- design-meds-review-together.png
- design-meds-plan-follows.png

## What changed
- Capability After image and A/B/C design images are now clean image-only scenes. No duplicated titles, status strips, Design Insight, callouts or CTA are baked into the images.
- The HTML card remains the single source for need status, Arthur consequence, collapsed Learn More and Design Insight.
- Round 1 Design uses the selected Medication A/B/C image rather than the generic medication storyboard.
- Strengthen retains the selected A/B/C image and adds a small `DESIGN STRENGTHENED` treatment. The environment no longer forgets the selected design.
- Consequence and final result screens use the selected A/B/C image when Medication Check is the only activated capability.
- If the player Extends with another capability, the existing combined storyboard remains in use because the portfolio now contains more than one visual state.

## Logic preserved
No costs, resources, IDs, causal scoring, event selection, response eligibility, Strengthen/Extend mechanics, persistence or multiplayer behavior changed.
