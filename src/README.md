# Player QR blank-screen fix v3

## Root cause
The router called `player()` for `?mode=player&room=XXXX`, but the current merged main.js did not contain a `player()` bootstrap function. That causes a JavaScript ReferenceError immediately after a phone scans the QR, leaving the app root blank.

## Fix
Adds `async function player()` that:
1. reads the room from the QR query string,
2. loads the Supabase session,
3. restores a previously joined player/table from localStorage when available,
4. otherwise lets playerView() render the registration/table join screen,
5. falls back to joinForm(room) if session loading fails instead of leaving a blank screen.

XPlayer remains dynamically isolated and the QR still points to `mode=player`.

## GitHub
Replace `src/main.js`.
Keep `src/xPlayer.js` and `src/xPlayer.css` present.

## Test
After Pages deploy finishes, create a NEW room and scan the NEW QR. The phone should render registration immediately.
