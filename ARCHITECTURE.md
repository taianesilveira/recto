# Architecture

## What this is

A collaborative document editor scoped to four things: editing,
import, sharing, and persistence. The brief said not to rebuild Google
Docs, and the scope cuts below are deliberate, not accidental gaps.

## Scope cuts, and why

**No real-time collaboration (no CRDT, no websocket server).** Yjs or
a comparable CRDT plus a sync server is roughly half a timeboxed build
on its own, and the brief explicitly offers it as an optional stretch,
not a requirement. Depth went into the editor, import, and permission
model instead. The seams for it exist — `documents.content` is a
single JSONB column, swappable for a CRDT document without touching
the schema's shape — but it isn't built.

**No comments or suggestion mode.** Same reasoning: a second
interaction model (anchored ranges, resolution state) competes
directly with the time the sharing and import features needed.

**Mocked auth, not a real auth provider.** `/sign-in` picks one of
three seeded accounts with no password. The brief explicitly allows
this ("seeded accounts, mocked auth, or a lightweight login flow").
Wiring a real OAuth provider would have added a dependency and a
setup step for reviewers without changing anything the brief
evaluates — the permission model behaves identically regardless of
how the session was established.

**Import always creates a new document.** Inserting into an
already-open draft was in scope per the brief's own examples, but
doubling the import entry points (new doc vs. append-to-draft) roughly
doubles the edge cases — what happens to formatting at the insertion
point, what the undo stack should do, how a conflicting selection
during the save debounce is handled — for a capability a reviewer can
already exercise end to end with the simpler version.

**No rich permission model beyond owner / editor / viewer.** The brief
allows this as a stretch ("role-based sharing permissions beyond basic
access"). Three roles is enough to demonstrate the access-control
boundary that actually matters for evaluation: can a non-owner read
without writing, can a non-editor write, can anyone outside both
groups see the document exists at all.

## Decisions worth explaining

**Two database drivers behind one `getDb()` function.**
`DATABASE_URL` set → Neon over HTTP (production). Unset → PGlite, a
Postgres build compiled to WASM, persisted to `./.data/recto`. Same
Drizzle schema, same queries, either way. The point: a reviewer clones
the repo and runs `npm run dev` with no database to install, no
Docker, no account to create. The cost is a small amount of
indirection in `lib/db/index.ts` and one Next.js config option
(`serverExternalPackages`) to stop the bundler from mangling PGlite's
WASM loading.

**Authorization goes through one function.** `getDocumentForUser(docId,
userId)` in `lib/auth/dal.ts` is the only place in the codebase allowed
to decide whether a user can see or touch a document. Every route,
action, and loader calls it and re-derives the role from the database
on that request — nothing trusts a role or ownership flag coming from
the client. `.kiro/skills/authz-boundary` documents the rule explicitly
so it survives beyond this session. The permission matrix test
(`tests/permissions.test.ts`) exists because this is the one piece of
logic where a regression is a real information leak, not a cosmetic
bug — a test here is worth more than a test almost anywhere else in
the app.

**"Not found" and "not allowed" return the same 404.** A user with no
relationship to a document gets a 404, not a 403. A 403 would confirm
the document exists; that's a small information leak about other
people's private documents, and the fix costs nothing (one `if`
returns `null` either way).

**The session is a signed cookie, re-verified against the database
every request.** `proxy.ts` (Next 16's renamed `middleware.ts`) does
an optimistic redirect by checking the signature, nothing more. The
database check in `lib/auth/dal.ts` is what actually authorizes a
request — tested by signing a token for a user id that doesn't exist
and confirming it's rejected even though the signature is valid.

**Editing and import share one conversion target.** Typed content and
imported content both end up as the same ProseMirror JSON the Tiptap
editor itself produces (`@tiptap/html`'s `generateJSON`, configured
with the identical `StarterKit` options as the live editor). An
imported heading is a real heading node, not a bolded paragraph
pretending to be one — it renders and behaves exactly like one typed
directly into the editor.

**Server Actions, not a separate API layer.** Every mutation (create,
rename, delete, save, import, share, revoke) is a Next.js Server
Action: a plain async function the client calls directly, with Next
handling the request/response plumbing. For a project this size, a
hand-rolled REST or tRPC layer on top would be ceremony without a
corresponding benefit — there's no separate client consuming this API
and no case where request/response shape needs to differ from a plain
function call.

**One design system, enforced as a skill, not a convention someone has
to remember.** `.kiro/skills/no-slop-ui/SKILL.md` encodes the actual
constraints (one accent color, 1px borders instead of shadows, a
four-size type scale, no gradients/glassmorphism/emoji-as-icon) as
rules that get re-read before UI work, rather than a style guide that
degrades the longer a project runs.

## What I'd build next with another 2-4 hours

In priority order:

1. **Comments or a lightweight suggestion mode.** The highest-value
   stretch feature given the brief's own suggestions, and the one that
   most changes how the product feels collaborative rather than
   single-player-with-a-share-button.
2. **Version history.** The schema already timestamps every save;
   keeping prior `content` snapshots on write (rather than overwriting
   in place) is a schema migration and a small UI, not a redesign.
3. **Vercel's Git integration.** `vercel git connect` failed in the
   sandbox this was built in — its git remote routes through a proxy
   gateway, not GitHub directly, so Vercel's GitHub App can't see the
   repository to install itself. Deploys are currently manual
   (`vercel deploy --prod`). Connecting the real GitHub repository from
   the Vercel dashboard directly (outside this sandbox) would fix it in
   a couple of minutes.
4. **Insert-into-open-draft for import**, the import variant cut above,
   once the new-document path has had real usage to surface any edge
   cases worth hardening before doubling the entry points.
