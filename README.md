# Arthur: By Design - Clean Shared Room Runtime v1

This package retires the legacy Facilitator/XPlayer route without modifying the working `src/main.js` solo game.

## Replace at repository root
- `index.html`

## Add to `src/`
- `sharedRoomRouter.js`
- `sharedRoomContent.js`
- `sharedRoomEngine.js`
- `sharedRoomHost.js`
- `sharedRoomPhone.js`
- `sharedRoom.css`

Do not replace `src/main.js`. Explore on My Own dynamically loads the existing `main.js` with `mode=solo`, preserving the solo experience.

## New routes
- Default URL: new landing
- `?mode=host`: shared presentation screen and host controls
- `?mode=join&room=ABCD`: participant phone
- `?mode=solo`: current single-player game

The default landing no longer exposes the legacy Facilitator, Player, or XPlayer routes.

## Canonical shared-room sequence
Meet Arthur -> opening question -> room response -> Arthur needs -> how to play -> card guide -> 4 AI investment vote -> capability activation -> 3 design choices -> design reveal -> Strengthen or Extend -> accumulated portfolio -> disruption -> response -> result.

Explicitly removed from the new runtime:
- facilitator election
- majority-rule setup
- Pressure Test
- Operating Commitment
- Operating Model
- second confirmation gates

## Database
No new SQL is required if the previous registration and unified-runtime migrations were run, including `sessions.reveal_step` and the participant identity fields.
