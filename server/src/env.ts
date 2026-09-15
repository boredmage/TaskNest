import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  PUBLIC_URL: z.string().url().default("http://localhost:8787"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  UPLOADS_DIR: z.string().default("./uploads"),
  EXPO_ACCESS_TOKEN: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  MAIL_FROM: z.string().default("TaskNest <no-reply@example.com>"),
  OVERDUE_SWEEP_INTERVAL_SECONDS: z.coerce.number().int().positive().default(300),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
