import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Error thrown by services/routes. `code` is a stable, machine-readable slug
 * the mobile client can switch on (mirrors the Supabase AuthError.code style
 * the client already handled, e.g. "invalid_credentials").
 */
export class HttpError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new HttpError(400, code, message, details);
export const unauthorized = (message = "Not authenticated", code = "unauthorized") =>
  new HttpError(401, code, message);
export const forbidden = (message: string, code = "forbidden") => new HttpError(403, code, message);
export const notFound = (message: string, code = "not_found") => new HttpError(404, code, message);
export const conflict = (message: string, code = "conflict") => new HttpError(409, code, message);
