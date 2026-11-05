# Arthur: By Design 0.1

A deliberately stripped-down multiplayer prototype for testing the approved loop:

**Arthur need → AI investment → one design commitment → optional second investment → common disruption → Arthur consequence → Vitruvian principle**

## What is included

- Facilitator/room view
- Phone/table view
- New Supabase schema with Realtime enabled
- Three settings: Leave Well, Recover Well, Live Well
- Four capabilities per setting
- One pivotal design decision per investment
- Optional second investment and undo
- Common disruption for every table
- Absorbed / Strained / Exposed discussion frame
- GitHub Pages deployment workflow
- No graphics, scoring engine or automatic consequence judgment yet

## 1. Create a new Supabase project

1. In Supabase, create a new project.
2. Open **SQL Editor**.
3. Paste and run `supabase/schema.sql`.
4. Open the project **Connect** dialog and copy:
   - Project URL
   - Publishable key

The SQL uses permissive public prototype policies so conference devices can join without accounts. Do not store sensitive or patient data. Tighten authentication and RLS before any production use.

## 2. Create the new GitHub repository

Suggested repository name: `arthur-by-design`

Because you work in the GitHub web interface:

1. Create a blank repository.
2. Choose **Add file → Upload files**.
3. Upload the contents of this package, preserving the folders.
4. Commit to `main`.

GitHub's web uploader may not preserve an empty folder, but every required folder here contains a file.

## 3. Add Supabase secrets to GitHub

In the new repository:

1. Go to **Settings → Secrets and variables → Actions**.
2. Add repository secret `VITE_SUPABASE_URL`.
3. Add repository secret `VITE_SUPABASE_PUBLISHABLE_KEY`.

Use the publishable client key, never a service-role or secret key.

## 4. Turn on GitHub Pages

1. Go to **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Open **Actions** and run **Deploy to GitHub Pages**, or make a small commit to trigger it.

The Vite configuration uses a relative base so it works under the repository path.

## 5. Play

1. Open the deployed site in a desktop browser.
2. Choose **Facilitator / room** and create a session.
3. On phones, open the same URL, choose **Player / table**, and enter the room code.
4. The facilitator advances the shared room screens.
5. Each table makes and confirms its own investments and design commitments.

## Important 0.1 test

Do not judge polish. Test whether players understand this without explanation:

> Buying the capability is not the design decision. The design decision is how they make it work, including the compromise they accept.

## Known 0.1 limits

- Consequences are discussed, not algorithmically scored.
- There is no QR generator yet; players type a four-character code.
- Prototype RLS permits anonymous read/write access.
- The facilitator can pace the session, but cannot edit a table's commitment.
- Reconnecting uses the table ID stored in that browser.
- Content and costs remain intentionally data-driven in `src/gameData.js` for rapid tuning.
