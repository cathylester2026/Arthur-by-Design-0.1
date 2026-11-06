# Arthur: By Design - visual opening question + privacy choices

## Replace in src/
- main.js
- participantCapture.js
- onboarding.css

## Add to assets/
- opening-question-hero.jpg

## What changed
- Opening question is now an architectural/story visual, not a text-only card.
- `SKIP FOR NOW` bypasses the open-ended response and stores no answer.
- Registration retains `Use My Email` and `Continue Anonymously`.
- Solo registration adds `PLAY WITHOUT SHARING ANY INFORMATION`.
  - no Supabase session/player record
  - no email
  - no alias persisted to Supabase
  - no open-ended response written to Supabase
  - gameplay stays local on the device
- Existing gameplay/scoring/causal logic is unchanged.

No new SQL is needed for this update beyond the anonymous-participant migration already provided for the alias option.
