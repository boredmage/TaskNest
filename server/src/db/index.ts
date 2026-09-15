import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.ts";
import * as schema from "./schema/index.ts";

export const sql = postgres(env.DATABASE_URL, { max: 10, idle_timeout: 30, onnotice: () => {} });

export const db = drizzle(sql, { schema });

/** Either the root client or a transaction handle. Services accept both. */
export type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export * from "./schema/index.ts";
