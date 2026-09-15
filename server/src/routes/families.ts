import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";
import * as families from "../services/families.ts";

const idParam = validate("param", z.object({ id: z.string().uuid() }));
const joinBody = z.object({ invite_code: z.string().trim().min(1).max(20) });
const inviteBody = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "member"]).default("member"),
});
const respondBody = z.object({ accept: z.boolean() });

export const familyRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .get("/me", async (c) => c.json(await families.getMyFamily(c.get("userId"))))
  .post("/", async (c) => c.json(await families.createFamily(c.get("userId")), 201))

  // Join with a code; the owner or an admin approves or declines.
  .post("/join-requests", validate("json", joinBody), async (c) =>
    c.json(await families.requestToJoin(c.get("userId"), c.req.valid("json").invite_code), 201)
  )
  .post("/join-requests/:id/approve", idParam, async (c) => {
    await families.approveJoinRequest(c.get("userId"), c.req.valid("param").id);
    return c.body(null, 204);
  })
  .post("/join-requests/:id/decline", idParam, async (c) => {
    await families.declineJoinRequest(c.get("userId"), c.req.valid("param").id);
    return c.body(null, 204);
  })

  // The owner invites by email; the invitee accepts or declines.
  .post("/invites", validate("json", inviteBody), async (c) =>
    c.json(await families.inviteByEmail(c.get("userId"), c.req.valid("json")), 201)
  )
  .post("/invites/:id/respond", idParam, validate("json", respondBody), async (c) => {
    await families.respondToInvite(c.get("userId"), c.req.valid("param").id, c.req.valid("json").accept);
    return c.body(null, 204);
  });
