import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db, notificationPreferences } from "../db/index.ts";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";

const body = z.object({ preferences: z.record(z.string(), z.boolean()) });

/** The toggles on the Notifications settings screen. */
export const preferenceRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .get("/", async (c) => {
    const [row] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.user_id, c.get("userId")));
    return c.json({ preferences: row?.preferences ?? {} });
  })
  .put("/", validate("json", body), async (c) => {
    const { preferences } = c.req.valid("json");
    await db
      .insert(notificationPreferences)
      .values({ user_id: c.get("userId"), preferences })
      .onConflictDoUpdate({ target: notificationPreferences.user_id, set: { preferences } });
    return c.json({ preferences });
  });
