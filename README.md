# Recto

A small, focused document editor. Create and edit rich-text documents,
import a file to start one, and share a document with another account
as a viewer or editor.

**Live:** https://recto-xi.vercel.app

## Sign in

There's no password. `/sign-in` lists three seeded accounts — pick one.

| Name | Email |
|---|---|
| Mara Vieira | `mara@recto.app` |
| Theo Prado | `theo@recto.app` |
| Inés Calvo | `ines@recto.app` |

Mara owns a seeded document, "Welcome to Recto," shared with Theo as an
editor. Sign in as either to see the owned/shared distinction, or as
Inés to see an account with nothing yet.

## Features

- **Documents.** Create, rename, delete. A dashboard separates documents
  you own from documents shared with you.
- **Editor.** Bold, italic, underline, three heading levels, bulleted
  and numbered lists, undo/redo. Autosaves 800ms after you stop typing,
  with a status indicator (Saved / Saving… / Unsaved changes).
- **File import.** Upload a `.txt`, `.md`, or `.docx` file (up to 5MB)
  to create a new document from it. Headings, bold/italic, and lists in
  the source file convert to the same node types the editor produces.
  Anything else (`.pdf`, `.doc`, images, etc.) or a file over the limit
  is rejected with a specific message, not a generic failure.
- **Sharing.** A document's owner can grant another seeded account
  `viewer` or `editor` access by email, change a role, or revoke it.
  Permission is re-checked on the server for every read and write, not
  just hidden in the UI — see `.kiro/skills/authz-boundary`.

## Running it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without a `DATABASE_URL`, the app uses
[PGlite](https://pglite.dev) (Postgres compiled to WASM) and persists
to `./.data/recto` — no database to install. Before the first run,
apply the schema and create the seeded accounts:

```bash
npm run db:migrate   # applies the schema
npm run db:seed       # creates the three accounts above
```

You'll need a `.env.local` with a session secret (copy `.env.example`):

```
SESSION_SECRET=anything-long-and-random
```

To point at a real Postgres instance (e.g. [Neon](https://neon.tech))
instead of the local PGlite file, add:

```
DATABASE_URL=postgres://...
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply the Drizzle schema |
| `npm run db:seed` | Create the three seeded accounts (idempotent) |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | ESLint |

## Stack

Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS 4,
Drizzle ORM, Tiptap, Postgres (Neon in production, PGlite locally),
`jose` for signed session cookies. No external auth provider, no paid
dependency anywhere in the stack.

## More detail

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — what was prioritized, what
  was cut, and why.
- [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) — how AI was used to build this,
  including the mistakes it made and how they were caught.
- [`SUBMISSION.md`](./SUBMISSION.md) — exactly what's included, what's
  working, and what's not.
