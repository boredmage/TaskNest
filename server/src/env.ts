import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  PUBLIC_URL: z.string().url().default("http://localhost:8787"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  UPLOADS_DIR: z.string().default("./uploads"),
  // Cloudflare R2 (optional). Set all five to store uploads in R2 instead of
  // UPLOADS_DIR. R2_PUBLIC_URL is the bucket's public base URL (r2.dev
  // subdomain or a custom domain), with no trailing slash.
  R2_ACCOUNT_ID: z.string().optional().default(""),
  R2_ACCESS_KEY_ID: z.string().optional().default(""),
  R2_SECRET_ACCESS_KEY: z.string().optional().default(""),
  R2_BUCKET: z.string().optional().default(""),
  R2_PUBLIC_URL: z.string().optional().default(""),
  EXPO_ACCESS_TOKEN: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  MAIL_FROM: z.string().default("TaskNest <no-reply@example.com>"),
  OVERDUE_SWEEP_INTERVAL_SECONDS: z.coerce.number().int().positive().default(300),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema
  .refine(
    (e) => {
      const r2 = [e.R2_ACCOUNT_ID, e.R2_ACCESS_KEY_ID, e.R2_SECRET_ACCESS_KEY, e.R2_BUCKET, e.R2_PUBLIC_URL];
      return r2.every(Boolean) || r2.every((v) => !v);
    },
    { message: "Set all of R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_URL, or none" }
  )
  .safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
