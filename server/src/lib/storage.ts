import { S3Client } from "bun";
import { join } from "node:path";
import { env } from "../env.ts";

/**
 * Where uploaded files live.
 *
 * With the R2_* variables set, files go to a Cloudflare R2 bucket through
 * Bun's built-in S3 client and `publicUrl` returns the bucket's public URL.
 * Without them (local dev), files go to UPLOADS_DIR and are served by the
 * server from /uploads.
 */
export interface Storage {
  /** Whether files are in R2 (true) or on the local disk (false). */
  readonly remote: boolean;
  put(key: string, file: File): Promise<void>;
  /** Idempotent: deleting a missing key is not an error. */
  remove(key: string): Promise<void>;
  /** Public URL for a stored key. */
  publicUrl(key: string): string;
}

function r2Storage(): Storage {
  const client = new S3Client({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto",
  });
  const base = env.R2_PUBLIC_URL.replace(/\/+$/, "");
  return {
    remote: true,
    async put(key, file) {
      await client.write(key, file, { type: file.type || "application/octet-stream" });
    },
    async remove(key) {
      await client.delete(key).catch(() => {});
    },
    publicUrl: (key) => `${base}/${key}`,
  };
}

function diskStorage(): Storage {
  return {
    remote: false,
    async put(key, file) {
      await Bun.write(join(env.UPLOADS_DIR, key), file);
    },
    async remove(key) {
      const f = Bun.file(join(env.UPLOADS_DIR, key));
      if (await f.exists()) await f.delete();
    },
    publicUrl: (key) => `${env.PUBLIC_URL}/uploads/${key}`,
  };
}

export const storage: Storage = env.R2_ACCOUNT_ID ? r2Storage() : diskStorage();
