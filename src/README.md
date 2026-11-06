# Medication Check before-to-after reveal, drop-in build

This build was merged directly into the supplied `main (9).js`. No patching is required.

## Replace at repository root
- `main.js`

## Add at repository root
- `medicationInvestmentTransition.js`
- `medicationInvestmentTransition.css`

## Add to `assets/`
- `medication-check-before.png`
- `medication-check-activated.png`

## Preserved flow and logic
The only changed route is the single-player Medication Check capability reveal:

`select Medication Check -> before/after reveal -> click NOW DESIGN AROUND IT -> existing 3A/3B/3C screen`

The visual module does not modify `soloState`, Capital, Change, activation IDs, scoring, events, Strengthen/Extend, responses, persistence, or multiplayer logic. It never advances automatically. The existing `soloSet('commitment')` handoff runs only after the player clicks `NOW DESIGN AROUND IT`.

## Timing and accessibility
- Before: 1.6 sec
- Crossfade: 0.65 sec
- After freezes until player action
- Skip Animation control
- Reduced-motion support
