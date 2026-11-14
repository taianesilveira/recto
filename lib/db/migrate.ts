// Applies pending migrations against whichever driver getDb() resolves to
// (Neon in production, PGlite locally). Safe to run repeatedly: drizzle
// tracks applied migrations in a __drizzle_migrations table.
import { mkdirSync } from "node:fs";
import { getDb } from "./index";

async function main() {
  if (!process.env.DATABASE_URL) {
    mkdirSync("./.data", { recursive: true });
  }
  const db = await getDb();

  if (process.env.DATABASE_URL) {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(db as never, { migrationsFolder: "./lib/db/migrations" });
  } else {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as never, { migrationsFolder: "./lib/db/migrations" });
  }

  console.log("Migrations applied.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
