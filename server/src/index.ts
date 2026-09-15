import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { websocket } from "hono/bun";
import { app } from "./app.ts";
import { runMigrations } from "./db/migrate.ts";
import { env } from "./env.ts";
import { startOverdueSweeper } from "./jobs/overdue.ts";

await mkdir(join(env.UPLOADS_DIR, "avatars"), { recursive: true });
await runMigrations();
const stopSweeper = startOverdueSweeper();

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  websocket,
  maxRequestBodySize: 16 * 1024 * 1024,
});

console.log(`TaskNest server listening on http://localhost:${server.port} (public: ${env.PUBLIC_URL})`);

const shutdown = () => {
  stopSweeper();
  server.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
