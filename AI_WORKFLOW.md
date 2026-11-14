# AI workflow note

I built this with [Kiro](https://kiro.dev), working through the task in
the same seven stages I laid out at the start: foundation, document CRUD,
the editor, file import, sharing, tests and error handling, deployment.
I had Kiro stop at the end of each stage and show me something that ran,
verified against a real running build rather than just "it compiles,"
before I approved moving to the next one. I didn't let it build everything
in one pass — that's the fastest way to end up with something broken in
ways that are hard to find.

## Rules I set before any UI code existed

I had Kiro install two skill files into `.kiro/skills/` before writing any
UI, plus one copied as-is from an external source:

- **`stop-slop`** — copied verbatim from
  [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
  (MIT, pinned to commit `8da1f03`), license kept alongside it. Targets
  AI-sounding prose: filler, hedging, the "it's not X, it's Y"
  construction, metronomic rhythm. This is why the README and this note
  don't read like a chatbot wrote them.
- **`no-slop-ui`** — written for this project, because I specifically did
  not want the interface to look AI-generated. It has a forbidden list
  (gradients, glassmorphism, emoji as icons, drop shadows on cards, "Get
  started in seconds" marketing copy inside the app) and a required list
  (one accent color, 1px borders, a four-size type scale, plain-verb
  buttons). It's why the app looks like a writing tool and not a SaaS
  landing page with an editor bolted on.
- **`authz-boundary`** — I had Kiro write this once the sharing feature's
  shape was clear, before it wrote the sharing code: a checklist that
  every document route re-checks permission through one shared function,
  and that "not found" and "not allowed" return the same response. Setting
  the rule down first meant it applied to the feature from the start
  instead of getting bolted on after I found a hole in it.

## Where I had to catch and correct it

These weren't things I spotted by reading the code and deciding it looked
wrong — they only showed up because I had Kiro actually run the app
against a production build and test it, and I pushed back when a result
didn't look right instead of accepting the first explanation.

- **Server Action body limit.** Next.js caps Server Action request bodies
  at 1MB by default. The import feature's own limit was 5MB. A file
  between those two sizes would have failed with a raw framework error
  instead of the app's own "too large" message — nothing in the code
  looked wrong until Kiro actually uploaded a 6MB test file and read the
  server log. I had it raise `serverActions.bodySizeLimit` in
  `next.config.ts` to fix it.
- **PGlite breaking under the bundler.** The first production build with
  the local Postgres-in-WASM driver threw a runtime type error on the
  document list page, despite building clean. Turbopack was bundling
  PGlite's own WASM files instead of leaving it as a real Node module.
  I had Kiro track it down by actually starting the server and hitting
  the page, not by guessing from the build output, and fix it with
  `serverExternalPackages` in the Next config.
- **A Server Action quietly losing its fallback.** Kiro had wrapped a
  rename action in a client-side closure so the UI could close itself
  after saving. That broke Next's ability to encode it as a real Server
  Action — the form lost its action ID and started rejecting requests. I
  caught this because I asked for the no-JS path to be tested with a
  plain HTTP client, not just clicked through in a browser, and that's
  exactly where it broke. Fixed by passing the action directly and
  moving the UI-closing logic to a separate `onSubmit`.
- **Next 16 renamed `middleware.ts` to `proxy.ts`.** I had Kiro check the
  Next.js docs vendored in `node_modules` before writing the session
  check, specifically because a framework this new means the model's
  training data is likely stale on exactly this kind of rename.

## Where the test looked broken and the product wasn't

Testing a contentEditable rich-text editor and real file uploads without
a UI meant scripting a headless browser and a raw HTTP client against a
running build. A few things looked like failures and weren't, and I made
Kiro run each one to ground rather than accept "probably fine":

- Content appeared to vanish after picking a heading from a dropdown,
  because the test's keyboard input kept landing on the dropdown instead
  of the editor — confirmed by checking the actual browser focus and
  selection state, not by retrying blindly.
- Formatting looked lost after a page reload, because the editor defers
  rendering until the client hydrates, so a plain HTTP request can't see
  it — confirmed by reading the server-rendered JSON props directly
  instead of grepping for HTML tags that only exist after hydration.
- A couple of the test script's own string checks were wrong (matching
  the wrong substring, not accounting for escaped quotes). I had those
  fixed in the test, not papered over by changing working app code to
  satisfy a broken assertion — that distinction mattered to me.

## What I didn't hand off

The scope cuts, the build order, and which extra hours would matter most
were my calls, written down as explicit tradeoffs in `ARCHITECTURE.md`
rather than left as whatever Kiro happened to build first. Kiro wrote the
code and ran the verification; the judgment about what was worth building
and in what order stayed mine.
