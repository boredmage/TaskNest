import type { MiddlewareHandler } from "hono";
import { unauthorized } from "../lib/errors.ts";
import { verifyAccessToken } from "../lib/jwt.ts";

export type AuthVariables = {
  userId: string;
  userEmail: string;
};

/** Requires a valid `Authorization: Bearer <access token>` header. */
export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw unauthorized("Missing bearer token");
  }
  const claims = await verifyAccessToken(token);
  if (!claims) {
    throw unauthorized("Invalid or expired token", "token_expired");
  }
  c.set("userId", claims.sub);
  c.set("userEmail", claims.email);
  await next();
};
