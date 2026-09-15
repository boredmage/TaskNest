import { Hono } from "hono";
import { z } from "zod";
import { badRequest } from "../lib/errors.ts";
import { validate } from "../lib/validate.ts";
import { requireAuth, type AuthVariables } from "../middleware/auth.ts";
import * as profiles from "../services/profiles.ts";

const patchBody = z
  .object({
    full_name: z.string().max(120).nullable().optional(),
    avatar_url: z.string().max(500).nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
  })
  .strict();
const idParam = z.object({ id: z.string().uuid() });
const idsQuery = z.object({
  ids: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().uuid()).max(100)),
});

export const profileRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .get("/me", async (c) => c.json(await profiles.getProfile(c.get("userId"))))
  .patch("/me", validate("json", patchBody), async (c) =>
    c.json(await profiles.updateProfile(c.get("userId"), c.req.valid("json")))
  )
  .post("/me/avatar", async (c) => {
    const { file } = await c.req.parseBody();
    if (!(file instanceof File))
      throw badRequest("file_required", "Send the image as multipart field `file`");
    return c.json(await profiles.saveAvatar(c.get("userId"), file), 201);
  })
  // What other users may see: name + avatar, for notification cards.
  .get("/", validate("query", idsQuery), async (c) =>
    c.json(await profiles.getPublicProfiles(c.req.valid("query").ids))
  )
  .get("/:id", validate("param", idParam), async (c) =>
    c.json(await profiles.getPublicProfile(c.req.valid("param").id))
  );
