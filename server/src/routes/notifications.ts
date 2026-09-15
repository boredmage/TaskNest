import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";
import * as notifications from "../services/notifications.ts";

const listQuery = z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) });
const idParam = z.object({ id: z.string().uuid() });
const patchBody = z
  .object({ data: z.record(z.string(), z.unknown()).optional(), read_at: z.string().nullable().optional() })
  .strict();

export const notificationRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .get("/", validate("query", listQuery), async (c) =>
    c.json(await notifications.listForUser(c.get("userId"), c.req.valid("query").limit))
  )
  .post("/read-all", async (c) => {
    await notifications.markAllRead(c.get("userId"));
    return c.body(null, 204);
  })
  .patch("/:id", validate("param", idParam), validate("json", patchBody), async (c) =>
    c.json(await notifications.patchForUser(c.get("userId"), c.req.valid("param").id, c.req.valid("json")))
  );
