# Arthur: By Design 0.2

Complete multiplayer repository reconstructed from the approved concept. Version 0.2 fixes the iPhone join path.

## Upload without a command line
1. Extract this ZIP.
2. In the GitHub repository, upload all extracted files and folders, replacing existing files.
3. Commit to `main`.
4. Keep GitHub Pages set to **GitHub Actions**.

## GitHub secrets
Under **Settings → Secrets and variables → Actions**, retain:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Supabase
For a fresh project, run `supabase/schema.sql` in SQL Editor. If 0.1 is already installed, this script is safe to rerun and refreshes the prototype policies.

Use the publishable client key, never the service-role secret. Do not store real patient information. The anonymous policies are only appropriate for a low-risk workshop prototype.

## 0.2 join changes
- Eight table buttons instead of typed table names
- Four-character room validation
- Automatic uppercase and whitespace cleanup
- iPhone-safe form submission
- Inline errors preserve the form
- Separate inactive-room and connection messages

## Test
Create a room on the facilitator view. On a phone choose Join a Room, enter the four-character code, choose a table, add initials and join. The table should appear on the facilitator board. Advance through Leave Well to verify real-time synchronization.
