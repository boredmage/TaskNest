import { upgradeWebSocket } from "hono/bun";
import { Hono } from "hono";
import { verifyAccessToken } from "../lib/jwt.ts";
import { subscribe, unsubscribe } from "../lib/realtime.ts";
import type { AuthVariables } from "../middleware/auth.ts";

/**
 * `GET /realtime?token=<access token>` upgrades to a WebSocket that streams
 * RealtimeEvents for the token's user. Browsers/RN can't set headers on a
 * WebSocket handshake, hence the query parameter.
 */
export const realtimeRoutes = new Hono<{ Variables: AuthVariables }>().get(
  "/",
  async (c, next) => {
    const claims = await verifyAccessToken(c.req.query("token") ?? "");
    if (!claims) return c.json({ error: { code: "unauthorized", message: "Invalid token" } }, 401);
    c.set("userId", claims.sub);
    await next();
  },
  upgradeWebSocket((c) => {
    const userId = c.get("userId");
    return {
      onOpen: (_evt, ws) => subscribe(userId, ws),
      onClose: (_evt, ws) => unsubscribe(userId, ws),
      onMessage: (evt, ws) => {
        if (evt.data === "ping") ws.send("pong");
      },
    };
  })
);
