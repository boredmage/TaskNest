import { Hono } from "hono";
import { realtimeRoutes } from "./routes/realtime.ts";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { ZodError, z } from "zod";
import { env, isProd } from "./env.ts";
import { HttpError } from "./lib/errors.ts";
import { authRoutes } from "./routes/auth.ts";
import { familyRoutes } from "./routes/families.ts";
import { notificationRoutes } from "./routes/notifications.ts";
import { preferenceRoutes } from "./routes/preferences.ts";
import { profileRoutes } from "./routes/profiles.ts";
import { pushTokenRoutes } from "./routes/push-tokens.ts";
import { todoRoutes } from "./routes/todos.ts";

export const app = new Hono();

app.use(secureHeaders());
app.use(cors({ origin: "*", allowHeaders: ["Authorization", "Content-Type"] }));
// Never echo the realtime handshake token into the log.
if (!isProd) app.use(logger((line) => console.log(line.replace(/token=[^\s&]+/, "token=…"))));

app.get("/", (c) => c.json({ name: "tasknest-server", ok: true }));
app.get("/health", (c) => c.json({ ok: true, time: new Date().toISOString() }));

// Uploaded avatars. `avatar_url` in profiles is relative to this mount.
app.use(
  "/uploads/*",
  serveStatic({
    root: env.UPLOADS_DIR,
    rewriteRequestPath: (path) => path.replace(/^\/uploads/, ""),
  })
);

const api = new Hono()
  .route("/auth", authRoutes)
  .route("/profiles", profileRoutes)
  .route("/families", familyRoutes)
  .route("/todos", todoRoutes)
  .route("/notifications", notificationRoutes)
  .route("/notification-preferences", preferenceRoutes)
  .route("/push-tokens", pushTokenRoutes)
  .route("/realtime", realtimeRoutes);

app.route("/v1", api);

app.notFound((c) =>
  c.json({ error: { code: "not_found", message: `No route for ${c.req.method} ${c.req.path}` } }, 404)
);

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ error: { code: err.code, message: err.message, details: err.details } }, err.status);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: { code: "http_error", message: err.message } }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json(
      { error: { code: "validation_error", message: z.prettifyError(err), details: err.issues } },
      400
    );
  }
  console.error(err);
  return c.json(
    { error: { code: "internal_error", message: isProd ? "Internal server error" : String(err) } },
    500
  );
});

export type AppType = typeof api;
