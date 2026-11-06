# XPlayer phone blank-screen hotfix

## Replace in src/
- main.js

## Ensure these already exist in src/
- xPlayer.js
- xPlayer.css

## Root issue addressed
XPlayer was added as a static dependency of main.js. That means every route, including the QR `mode=player` route on phones, had to load/resolve the XPlayer module before the normal phone app could boot.

This patch isolates XPlayer with dynamic imports that run only when `mode=xplayer`.
The phone QR route remains the established `?mode=player&room=XXXX` flow.

This main is based on the later opening-question/privacy version rather than reverting to an older main13 phone flow.

## Test
1. Upload all three src files and wait for GitHub Pages deploy to finish.
2. Hard refresh facilitator page.
3. Create a NEW room.
4. Scan the new QR on a phone.
5. Phone should open registration/table selection.
6. For XPlayer, manually open the same site with `?mode=xplayer&room=XXXX` on the presentation computer.
