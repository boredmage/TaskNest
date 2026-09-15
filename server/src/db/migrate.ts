import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "./index.ts";

export async function runMigrations() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}

if (import.meta.main) {
  runMigrations()
    .then(async () => {
      console.log("Migrations applied");
      await sql.end();
    })
    .catch(async (err) => {
      console.error("Migration failed", err);
      await sql.end();
      process.exit(1);
    });
}
