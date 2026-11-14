import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { documents, documentShares, users } from "@/lib/db/schema";

export type OwnedDocumentSummary = {
  id: string;
  title: string;
  updatedAt: Date;
};

export type SharedDocumentSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  role: "editor" | "viewer";
  ownerName: string;
};

export async function getDocumentsForUser(userId: string) {
  const db = await getDb();

  const owned = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, userId))
    .orderBy(desc(documents.updatedAt));

  const shared = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      role: documentShares.role,
      ownerName: users.name,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documentShares.documentId, documents.id))
    .innerJoin(users, eq(documents.ownerId, users.id))
    .where(eq(documentShares.userId, userId))
    .orderBy(desc(documents.updatedAt));

  return {
    owned: owned as OwnedDocumentSummary[],
    shared: shared as SharedDocumentSummary[],
  };
}
