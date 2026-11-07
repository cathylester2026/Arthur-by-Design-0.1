# Arthur: By Design - QR Invitation Screen v1

This package is built on the QR-fixed parity runtime. It changes the host's first screen into a dedicated invitation-to-play screen with a large QR code, room code and explicit fallback URL.

Replace repository root:
- index.html

Replace/add in src/:
- leaveWellExperience.js
- parityRouter.js
- parityEngine.js
- parityHost.js
- parityPhone.js
- parity.css

Do not replace src/main.js.

## Test
1. Open Host a Room and create a session.
2. The very first shared screen is the invitation screen.
3. Scan the large center-right QR using an actual phone camera.
4. The encoded URL is generated from the currently deployed page origin/path and contains `?mode=join&room=XXXX`.
5. If scanning fails, type the same displayed URL manually. If manual URL fails too, the problem is routing/session creation rather than the QR image itself.
