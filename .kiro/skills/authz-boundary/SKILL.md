---
name: authz-boundary
description: Authorization checklist for Recto. Use whenever writing or changing a server action, route handler, or data loader that reads or writes a document, share, or attachment. Prevents the class of bug where UI hides a button but the server still allows the action.
---

# authz-boundary

Recto has three authorization facts that must hold everywhere a document is touched:

1. The owner can do anything to their own document.
2. A user with an `editor` share can read and write content, but cannot manage sharing or delete the document.
3. A user with a `viewer` share can read only. No write path should ever succeed for them, even if called directly.
4. A user with no owner row and no share row gets a 404, not a 403. Do not reveal that a document exists to someone who cannot see it.

## Rule

Every server action, route handler, or loader that takes a `documentId` must call a single shared authorization function (e.g. `getDocumentForUser(documentId, userId)` in `lib/auth/dal.ts`) before touching data. Never:

- Trust a role or ownership flag sent from the client.
- Check permission only in a client component and assume the server route is safe because the button is hidden.
- Reuse a permission check result across requests. Re-fetch from the database every time; sessions and shares can change between requests.

## When reviewing or writing code, check

- Does this new route/action call the shared authorization function, or does it query `documents`/`document_shares` directly?
- If this is a write path (edit content, rename, delete, change sharing), does it reject `viewer` role explicitly?
- If this is a sharing-management path (invite, revoke, change role), does it reject everyone except the owner?
- Does the "not found vs not allowed" distinction leak information in the HTTP status or error message returned to the client?

## Test obligation

Any new permission branch gets a corresponding case in the permission matrix test (see etapa 5 test plan). A new role check without a test is incomplete, not done.
