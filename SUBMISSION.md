# Submission

## Live product

**https://recto-xi.vercel.app**

No credentials needed beyond picking an account on `/sign-in` — there is
no password by design (see `ARCHITECTURE.md`).

| Account | Email | Starting point |
|---|---|---|
| Mara Vieira | `mara@recto.app` | Owns "Welcome to Recto," shared with Theo as editor |
| Theo Prado | `theo@recto.app` | Has editor access to Mara's document |
| Inés Calvo | `ines@recto.app` | No documents yet — a clean account |

## What's in this repository

- `app/`, `lib/` — the application (Next.js 16, App Router)
- `tests/` — 19 automated tests: the permission matrix and the file
  import converters
- `.kiro/skills/` — the three skill files that constrained how this was
  built (see `AI_WORKFLOW.md`)
- `README.md` — setup and run instructions
- `ARCHITECTURE.md` — what was prioritized, what was cut, and why
- `AI_WORKFLOW.md` — how AI was used, including where it was wrong and
  how that was caught
- This file

## What's working

- Create, rename, delete a document
- Rich-text editing: bold, italic, underline, three heading levels,
  bulleted and numbered lists, undo/redo
- Autosave with a visible status indicator
- Import `.txt`, `.md`, or `.docx` (up to 5MB) into a new document, with
  headings/marks/lists converted, not flattened to plain text
- Share a document with another seeded account as viewer or editor;
  change the role; revoke access
- Server-side permission enforcement independent of the UI (tested
  directly — see `tests/permissions.test.ts`)
- Persistence across refresh and across sessions (Postgres via Neon in
  production)
- A styled 404 and error boundary instead of Next's defaults
- Deployed and reachable at the URL above

## What's incomplete or cut

- **No real-time collaboration.** Documented as a deliberate scope cut
  in `ARCHITECTURE.md`, not an oversight.
- **No comments, suggestions, or version history.** Same — see the
  "what I'd build next" list in `ARCHITECTURE.md`.
- **Import only creates a new document.** It does not insert into a
  draft that's already open. Stated in the UI and in the README.
- **No automatic deploy on push.** `vercel git connect` could not link
  this sandbox's git remote to the real GitHub repository (the remote
  routes through a proxy gateway here, not GitHub directly). Deploys are
  manual (`vercel deploy --prod`) until that's connected from outside
  this sandbox.

## What I'd build next with another 2-4 hours

See the prioritized list at the end of `ARCHITECTURE.md`: comments or a
suggestion mode first, then version history, then connecting Vercel's
Git integration for automatic deploys, then the insert-into-open-draft
import variant.

## Not included in this repository

Per the assignment's submission format, the following are produced
outside this repo and referenced here, not committed to it:

- Google Drive folder link
- Walkthrough video URL (English, point-by-point)
- Screenshots / demo GIF, if needed beyond the README's setup steps
