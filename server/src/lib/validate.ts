import { zValidator as base } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z, type ZodType } from "zod";
import { HttpError } from "./errors.ts";

/**
 * zValidator that reports failures through the same `{ error: { code,
 * message, details } }` envelope as every other error in the API.
 */
export const validate = <T extends ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) =>
  base(target, schema, (result) => {
    if (!result.success) {
      throw new HttpError(400, "validation_error", z.prettifyError(result.error), result.error.issues);
    }
  });
