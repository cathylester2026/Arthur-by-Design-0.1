# Arthur: By Design - Solo / Shared Content Parity v1

Replace repository root `index.html` and add/replace these files in `src/`:
- leaveWellExperience.js
- parityRouter.js
- parityEngine.js
- parityHost.js
- parityPhone.js
- parity.css

Do not replace `src/main.js`. Explore on My Own continues to load the current canonical solo game.

The default landing now routes only to Host a Room, Join a Room and Explore on My Own. Host and Phone share the same `leaveWellExperience.js` content registry.
