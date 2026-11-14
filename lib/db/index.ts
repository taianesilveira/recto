import * as schema from "./schema";

// Two drivers, one schema. With DATABASE_URL set, we talk to Neon over
// HTTP (production). Without it, we fall back to PGlite, a Postgres
// build compiled to WASM that persists to a local folder. This means
// `npm run dev` works right after `npm install`, with no database to
// install or configure.
type Database =
  | ReturnType<typeof import("drizzle-orm/neon-http").drizzle>
  | Awaited<ReturnType<typeof createPgliteDb>>;

async function createPgliteDb() {
  const { mkdirSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  // PGlite resolves this path internally in a way that breaks on a
  // relative string once the code runs from a bundled .next output
  // (different cwd assumptions). An absolute path avoids that.
  const dataDir = resolve(process.cwd(), ".data/recto");
  mkdirSync(dataDir, { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite(dataDir);
  return drizzle({ client, schema });
}

let dbPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const url = process.env.DATABASE_URL;
    if (url) {
      const { neon } = await import("@neondatabase/serverless");
      const { drizzle } = await import("drizzle-orm/neon-http");
      const sql = neon(url);
      return drizzle({ client: sql, schema });
    }
    return createPgliteDb();
  })();

  return dbPromise;
}
