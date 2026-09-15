import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";
import * as auth from "../services/auth.ts";

const email = z.string().trim().email().max(320);
const password = z.string().min(8, "Password must be at least 8 characters").max(200);

const credentials = z.object({ email, password });
const signInBody = z.object({ email, password: z.string().min(1) });
const refreshBody = z.object({ refresh_token: z.string().min(1) });
const signOutBody = z
  .object({ refresh_token: z.string().optional(), everywhere: z.boolean().optional() })
  .default({});
const changePasswordBody = z.object({ current_password: z.string().min(1), new_password: password });
const forgotBody = z.object({ email });
const verifyBody = z.object({ email, code: z.string().trim().length(6) });
const resetBody = z.object({ reset_token: z.string().min(1), password });

export const authRoutes = new Hono<{ Variables: AuthVariables }>()
  .post("/sign-up", validate("json", credentials), async (c) => {
    const { email, password } = c.req.valid("json");
    return c.json(await auth.signUp(email, password), 201);
  })
  .post("/sign-in", validate("json", signInBody), async (c) => {
    const { email, password } = c.req.valid("json");
    return c.json(await auth.signIn(email, password));
  })
  .post("/refresh", validate("json", refreshBody), async (c) =>
    c.json(await auth.refreshSession(c.req.valid("json").refresh_token))
  )
  .post("/sign-out", requireAuth, validate("json", signOutBody), async (c) => {
    const { refresh_token, everywhere } = c.req.valid("json");
    await auth.signOut(c.get("userId"), refresh_token, everywhere);
    return c.body(null, 204);
  })
  .get("/me", requireAuth, async (c) => c.json({ user: await auth.getUser(c.get("userId")) }))
  .post("/password/change", requireAuth, validate("json", changePasswordBody), async (c) => {
    const { current_password, new_password } = c.req.valid("json");
    await auth.changePassword(c.get("userId"), current_password, new_password);
    return c.body(null, 204);
  })
  .post("/password/forgot", validate("json", forgotBody), async (c) => {
    await auth.requestPasswordReset(c.req.valid("json").email);
    return c.json({ ok: true });
  })
  .post("/password/verify", validate("json", verifyBody), async (c) => {
    const { email, code } = c.req.valid("json");
    return c.json(await auth.verifyPasswordResetCode(email, code));
  })
  .post("/password/reset", validate("json", resetBody), async (c) => {
    const { reset_token, password } = c.req.valid("json");
    await auth.resetPassword(reset_token, password);
    return c.body(null, 204);
  });
