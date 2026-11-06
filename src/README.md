# Permanent XPlayer shell + Medication Check 3B slice

## Upload to GitHub src/
Replace:
- main.js

Add:
- xPlayer.js
- xPlayer.css

## Open
Use the same deployed Pages URL with:
`?mode=xplayer&room=ROOMCODE`
Example: `https://your-pages-url/?mode=xplayer&room=ABCD`

## Permanent shell
- 16:9 full-screen presentation surface
- ARRIVE / INVEST / DESIGN / ADAPT / RESPOND / RESULT progress rail
- live Supabase subscription to sessions, teams, players and votes
- table LOCKED / THINKING strip without exposing choices
- facilitator Back / Reveal / Next controls
- keyboard: Left/Right arrows, Space to Reveal, F for fullscreen
- no scrolling

## Medication Check 3B slice
1. Arthur arrival
2. Medication Check investment vote, live table locks
3. Before reveal
4. Medication Check Activated reveal
5. A/B/C design vote, live table locks
6. Review Together architectural payoff with facilitator-controlled layers:
   - Arthur consequence
   - Design Readiness
   - Design Insight

## Phone synchronization
Entering Investment sets session phase to `cap_vote1`.
Entering capability reveal sets `cap_talk1`.
Entering design vote sets `commit_vote1`.
Entering design reveal sets `commit_talk1`.

## Important current scope
This is the permanent shell plus one validated content slice. The legacy facilitator view remains available at `?mode=facilitator&room=ROOMCODE`. The XPlayer does not yet replace every facilitator scene.
