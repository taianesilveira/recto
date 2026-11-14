// Seeds three demo accounts. Idempotent: running twice does not duplicate
// rows, so it is safe to call again after a deploy.
import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users, documents, documentShares } from "./schema";

const SEED_USERS = [
  { name: "Mara Vieira", email: "mara@recto.app" },
  { name: "Theo Prado", email: "theo@recto.app" },
  { name: "Inés Calvo", email: "ines@recto.app" },
];

async function ensureUser(
  db: Awaited<ReturnType<typeof getDb>>,
  user: { name: string; email: string },
) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, user.email))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(users).values(user).returning();
  return created;
}

async function main() {
  const db = await getDb();

  const [mara, theo, ines] = await Promise.all(
    SEED_USERS.map((u) => ensureUser(db, u)),
  );

  const existingDocs = await db
    .select()
    .from(documents)
    .where(eq(documents.ownerId, mara.id))
    .limit(1);

  if (existingDocs.length === 0) {
    const [doc] = await db
      .insert(documents)
      .values({
        title: "Welcome to Recto",
        ownerId: mara.id,
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Welcome to Recto" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This document is owned by Mara and shared with Theo as an editor. Sign in as either account to see the difference between owned and shared documents.",
                },
              ],
            },
          ],
        },
      })
      .returning();

    await db.insert(documentShares).values({
      documentId: doc.id,
      userId: theo.id,
      role: "editor",
    });
  }

  console.log("Seeded users:", [mara, theo, ines].map((u) => u.email));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
