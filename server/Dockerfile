# syntax=docker/dockerfile:1

# ---- TaskNest API ----------------------------------------------------------
# Hono on Bun, listening on port 8787. Migrations (./drizzle) run at startup.
FROM oven/bun:1.3-slim

WORKDIR /app

# Install dependencies first so this layer stays cached across source edits.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Application source and SQL migrations (everything else is excluded via
# .dockerignore). tsconfig is needed for the "@/..." path alias at runtime.
COPY tsconfig.json ./
COPY src ./src
COPY drizzle ./drizzle

# Local-disk avatar fallback (used only when the R2_* variables are unset);
# mounted as a named volume by docker-compose so it survives redeploys.
RUN mkdir -p /app/uploads && chown -R bun:bun /app

# The base image ships an unprivileged "bun" user.
USER bun

ENV NODE_ENV=production \
    PORT=8787 \
    UPLOADS_DIR=/app/uploads

EXPOSE 8787

# Liveness probe on the open /health route. The slim image has no curl, so
# use bun itself.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD bun --eval "fetch('http://127.0.0.1:8787/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/index.ts"]
