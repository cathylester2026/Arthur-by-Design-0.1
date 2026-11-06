# Medication Check Reveal Fix v4

This corrects the issues visible in the screenshots.

## Root: replace/overwrite
- main.js
- medicationInvestmentTransition.js
- medicationInvestmentTransition.css
- medicationDesignReveals.js
- medicationDesignReveals.css

## assets/: replace/overwrite
- medication-check-before.png
- medication-check-activated.png
- design-meds-ai-check-first.png
- design-meds-review-together.png
- design-meds-plan-follows.png

## Corrected behavior
- Medication capability reveal remains Before -> Activated -> NOW DESIGN AROUND IT.
- All three medication designs route through the new dedicated design reveal component:
  - nurse -> AI Check First image
  - pharmacy -> Review Together image
  - huddle -> Plan Follows Arthur image
- Legacy storyboard/generic medication reveal is bypassed for all three design choices.
- Need status uses icons + green/yellow/red pills.
- Detailed white boxes are collapsed inside WHY THIS MATTERS - LEARN MORE.
- AHA is replaced by DESIGN INSIGHT.
- The design reveal is compact enough to fit substantially more content above the fold.

## Logic
No costs, resources, scoring, causal logic, stored IDs, Strengthen/Extend, events, responses, persistence, or multiplayer behavior changed.
