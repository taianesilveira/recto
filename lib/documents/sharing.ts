import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { documentShares, users } from "@/lib/db/schema";

export type ShareRow = {
  shareId: string;
  userId: string;
  name: string;
  email: string;
  role: "editor" | "viewer";
};

export async function getSharesForDocument(
  documentId: string,
): Promise<ShareRow[]> {
  const db = await getDb();
  const rows = await db
    .select({
      shareId: documentShares.id,
      userId: documentShares.userId,
      name: users.name,
      email: users.email,
      role: documentShares.role,
    })
    .from(documentShares)
    .innerJoin(users, eq(documentShares.userId, users.id))
    .where(eq(documentShares.documentId, documentId));

  return rows;
}
