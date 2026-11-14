// Shared setup for tests that need a real (in-memory) database rather
// than mocks: the permission matrix is exactly the kind of logic where
// a mock would hide the bug it's meant to catch. See
// .kiro/skills/authz-boundary.
process.env.PGLITE_IN_MEMORY = "1";
process.env.SESSION_SECRET ??= "test-secret-not-used-for-anything-real";

import { migrate } from "drizzle-orm/pglite/migrator";
import { getDb } from "@/lib/db";
import { users, documents, documentShares } from "@/lib/db/schema";

export async function freshDb() {
  const db = await getDb();
  await migrate(db as never, { migrationsFolder: "./lib/db/migrations" });
  return db;
}

export async function seedUser(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string,
  name: string,
) {
  const [user] = await db.insert(users).values({ name, email }).returning();
  return user;
}

export async function seedDocument(
  db: Awaited<ReturnType<typeof getDb>>,
  ownerId: string,
  title = "Test document",
) {
  const [doc] = await db
    .insert(documents)
    .values({ title, ownerId, content: { type: "doc", content: [] } })
    .returning();
  return doc;
}

export async function seedShare(
  db: Awaited<ReturnType<typeof getDb>>,
  documentId: string,
  userId: string,
  role: "editor" | "viewer",
) {
  const [share] = await db
    .insert(documentShares)
    .values({ documentId, userId, role })
    .returning();
  return share;
}
