# Clean Shared Room Runtime v2
This package updates only the clean shared-room files. It does not replace `src/main.js` and does not alter Explore on My Own.

Replace at repository root: `index.html`
Replace/add in `src/`: `sharedRoomRouter.js`, `sharedRoomContent.js`, `sharedRoomEngine.js`, `sharedRoomHost.js`, `sharedRoomPhone.js`, `sharedRoom.css`

Assets are resolved from the existing `public/assets/` folder through Vite's `BASE_URL`, fixing GitHub Pages asset paths without requiring image re-upload.

Fixes:
- Restores imagery and content to the 4 investments and 12 design choices.
- Adds For Arthur, Design Question, cost and Learn More to cards.
- Strengthen/Extend buttons now visibly register the vote.
- Strengthen marks the selected design as strengthened.
- Extend returns extending tables to a second investment, hides the owned capability, and uses separate cycle-2 vote keys.
- Strengthened tables wait while extending tables complete their second choice.
