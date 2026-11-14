# Walkthrough script (English, ~4 minutes)

Record this as a screen capture against the live deployment
(https://recto-xi.vercel.app), narrating as you go. Timings are
approximate — talk at a normal pace, don't rush.

---

**[0:00–0:20] Intro**

"This is Recto, a small document editor I built for this assignment.
It's a lightweight Google Docs: create a document, edit it with rich
text, import a file into one, and share it with another account as a
viewer or an editor. I'll walk through each of those, then talk briefly
about what I cut and why."

**[0:20–0:50] Sign-in and the dashboard**

Navigate to `/sign-in`. "There's no password — I seeded three accounts
to keep the scope reasonable, which the assignment explicitly allows.
I'll sign in as Mara."

Click Mara's account, land on `/documents`. "The dashboard splits into
two sections: documents I own, and documents shared with me. Mara
already owns one, 'Welcome to Recto,' which I've shared with Theo as an
editor — I'll come back to that."

**[0:50–1:50] Creating and editing a document**

Click "New document." "This creates a document and takes me straight
into the editor."

Type a heading, select it, switch it to Heading 1 from the dropdown.
Type a paragraph, select part of it, apply bold and italic. Add a
bulleted list with two items.

"Bold, italic, underline, three heading levels, bulleted and numbered
lists, undo and redo. In the corner here" — point at the status label —
"autosave kicks in about 800 milliseconds after I stop typing, and this
label tells me whether it's saved, saving, or has unsaved changes."

Reload the page. "And it's still here after a refresh — this is backed
by real Postgres, not local storage."

Rename the document via the Rename control. "Renaming works the same
way, from either the document page or the dashboard list."

**[1:50–2:30] File import**

Navigate back to `/documents`. "I can also import a file instead of
typing from scratch." Point at the import control. "It accepts `.txt`,
`.md`, or `.docx`, up to 5 megabytes — both limits are stated right
here in the UI, not just in the README."

Upload a prepared `.md` file with a heading and a bulleted list.
"And the formatting converts properly — this heading and this list
aren't plain text with the right font, they're the same node types the
editor itself produces. I can keep editing it immediately."

**[2:30–3:20] Sharing**

Open the document created a minute ago. Scroll to the sharing panel.
"As the owner, I can share this with another seeded account." Type
Theo's email, pick 'Viewer,' submit. "Now Theo has read-only access."

Switch accounts (sign out, sign in as Theo). Open the shared document.
"Theo sees it as a viewer — no toolbar, no sharing panel, this field
tells him the role up here." Point at the role badge.

"Back as Mara" — switch accounts again — "I can change Theo's role to
editor, or revoke access entirely, and the server re-checks every one of
these on the backend, not just in what the interface shows. I wrote an
automated test specifically for that permission logic, because that's
the one place a bug would mean someone seeing or editing something they
shouldn't."

**[3:20–3:50] What I cut, briefly**

"I did not build real-time collaboration, comments, or version
history. All three were explicitly optional stretch goals in the
assignment, and the brief was clear that depth in a few areas beats
shallow coverage everywhere — so I put the time into the editor, import,
and the permission model instead, and wrote that reasoning down in
ARCHITECTURE.md."

**[3:50–4:00] Close**

"That's Recto — editing, import, sharing, and persistence, deployed and
live at the URL in the README. Thanks for watching."
