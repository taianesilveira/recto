import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, documents, documentShares } from "@/lib/db/schema";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

// cache() de-dupes this within a single request/render pass, but it does
// NOT persist across requests. Every request re-reads the cookie and
// re-queries the database. This is the one place the rest of the app
// trusts for "who is the current user" — the proxy only redirects
// optimistically, it does not authorize anything.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const db = await getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
});

export type DocumentAccess = {
  document: typeof documents.$inferSelect;
  role: "owner" | "editor" | "viewer";
};

/**
 * The single authorization gate for anything document-scoped. See
 * .kiro/skills/authz-boundary — every route/action that touches a
 * document must go through this, never query documents/document_shares
 * directly to decide access.
 *
 * Returns null for both "does not exist" and "exists but you have no
 * access" so callers can return a 404 in either case without leaking
 * which one it was.
 */
export async function getDocumentForUser(
  documentId: string,
  userId: string,
): Promise<DocumentAccess | null> {
  const db = await getDb();

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) return null;

  if (document.ownerId === userId) {
    return { document, role: "owner" };
  }

  const [share] = await db
    .select()
    .from(documentShares)
    .where(
      and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId),
      ),
    )
    .limit(1);

  if (!share) return null;

  return { document, role: share.role };
}

export function canWrite(role: DocumentAccess["role"]) {
  return role === "owner" || role === "editor";
}

export function canManageSharing(role: DocumentAccess["role"]) {
  return role === "owner";
}
