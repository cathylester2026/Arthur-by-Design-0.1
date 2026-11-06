# Medication Check A/B/C reveal upgrade

This is the next drop-in build after `Arthur_By_Design_Medication_Check_DropIn_main9_v1.zip`.

## Replace at repository root
- `main.js`

## Add at repository root
- `medicationDesignReveals.js`
- `medicationDesignReveals.css`

The existing transition files are included for completeness and may safely overwrite the deployed copies:
- `medicationInvestmentTransition.js`
- `medicationInvestmentTransition.css`

## Add to `assets/`
- `design-meds-ai-check-first.png`
- `design-meds-review-together.png`
- `design-meds-plan-follows.png`

The existing capability images are also included for completeness:
- `medication-check-before.png`
- `medication-check-activated.png`

## Resulting chain
Before -> Medication Check Activated -> existing A/B/C selection -> selected A, B, or C design-impact reveal -> portfolio review.

## Logic preserved
The reveal branch uses the existing stored design IDs:
- `nurse` = AI Check First
- `pharmacy` = Review Together
- `huddle` = Plan Follows Arthur

No cost, resource, scoring, causal, event, response, persistence, multiplayer, or Strengthen/Extend logic is changed. The player still clicks `REVIEW YOUR DESIGN` to continue to the existing `design` phase.
