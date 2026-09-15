import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db, userPushTokens } from "../db/index.ts";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";

const body = z.object({ token: z.string().min(1).max(500), platform: z.string().max(20).default("expo") });

export const pushTokenRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .put("/", validate("json", body), async (c) => {
    await db
      .insert(userPushTokens)
      .values({ user_id: c.get("userId"), ...c.req.valid("json") })
      .onConflictDoNothing();
    return c.body(null, 204);
  })
  // Remove one token, or every token for the user when no body is sent (sign-out).
  .delete("/", async (c) => {
    const userId = c.get("userId");
    const { token } = await c.req.json<{ token?: string }>().catch(() => ({ token: undefined }));
    await db
      .delete(userPushTokens)
      .where(
        token
          ? and(eq(userPushTokens.user_id, userId), eq(userPushTokens.token, token))
          : eq(userPushTokens.user_id, userId)
      );
    return c.body(null, 204);
  });
