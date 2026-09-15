#!/usr/bin/env bash
#
# deploy.sh — deploy / update the TaskNest API on a VPS with Docker.
#
# Brings up three containers via Docker Compose:
#   * tasknest-postgres  — Postgres 16 (internal + localhost only)
#   * tasknest-api       — Bun/Hono API, published on host port 8787
#   * tasknest-db-backup — nightly pg_dump snapshots into ./backups
#
# Usage:
#   ./deploy.sh              # build + (re)start the stack
#   ./deploy.sh --pull       # git pull first, then build + restart
#   ./deploy.sh --logs       # after a successful deploy, tail the API logs
#   ./deploy.sh rollback     # re-run the previous API image (bad-deploy escape)
#   ./deploy.sh down         # stop + remove containers (data volumes are kept)
#
# Env overrides:
#   API_PORT=8787            # host port the API is published on
#
set -euo pipefail

API_PORT="${API_PORT:-8787}"

# Always operate from the directory this script lives in (server/).
cd "$(dirname "$0")"

log()  { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

# --- Resolve the compose command (v2 plugin vs legacy v1) -------------------
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  die "Docker Compose not found. Install Docker Engine + the compose plugin (see DEPLOYMENT.md)."
fi

# --- down subcommand --------------------------------------------------------
if [ "${1:-}" = "down" ]; then
  log "Stopping the stack (tasknest_pgdata and tasknest_uploads volumes are preserved)…"
  $COMPOSE down
  exit 0
fi

# --- Health wait (shared by deploy and rollback) -----------------------------
wait_healthy() {
  log "Waiting for the API on port ${API_PORT}…"
  for _ in $(seq 1 30); do
    if curl -fsS "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
      log "API is healthy → http://127.0.0.1:${API_PORT}/health"
      return 0
    fi
    sleep 2
  done
  return 1
}

# --- rollback subcommand ------------------------------------------------------
# Re-runs the previous image (tagged :previous by the last deploy). Code only —
# schema migrations already applied by the newer build stay in place, which
# the app tolerates as long as they were additive.
if [ "${1:-}" = "rollback" ]; then
  docker image inspect tasknest-api:previous >/dev/null 2>&1 \
    || die "No tasknest-api:previous image — nothing to roll back to."
  log "Rolling back to the previous API image…"
  docker tag tasknest-api:previous tasknest-api:latest
  $COMPOSE up -d --no-build api
  wait_healthy || { $COMPOSE logs --tail=50 api; die "Rollback started but the health check failed."; }
  $COMPOSE ps
  exit 0
fi

# --- Parse flags ------------------------------------------------------------
PULL=0
TAIL=0
for arg in "$@"; do
  case "$arg" in
    --pull) PULL=1 ;;
    --logs) TAIL=1 ;;
    *) warn "ignoring unknown argument: $arg" ;;
  esac
done

# --- Preflight: .env ----------------------------------------------------------
# Only PUBLIC_URL (and optionally the R2_* / RESEND values) need a human.
# Secrets the server generates for itself are written back into .env on the
# first deploy and reused after that.
if [ ! -f .env ]; then
  warn ".env not found — creating one from .env.example."
  cp .env.example .env
fi

env_val() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- | tr -d '"' ; }

# set_env KEY VALUE: replace the KEY= line in .env, or append it.
set_env() {
  if grep -qE "^$1=" .env; then
    sed -i.bak -E "s|^$1=.*|$1=$2|" .env && rm -f .env.bak
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}

# Production mode, always.
[ "$(env_val NODE_ENV || true)" = "production" ] || set_env NODE_ENV production

# Sessions are signed with JWT_SECRET: generate one if it's missing or the
# template value. Changing it later logs everyone out, so it's only ever set
# once here.
SECRET="$(env_val JWT_SECRET || true)"
if [ -z "$SECRET" ] || [ "$SECRET" = "change-me-to-a-long-random-string" ] || [ "${#SECRET}" -lt 32 ]; then
  log "Generating JWT_SECRET…"
  set_env JWT_SECRET "$(openssl rand -base64 48 | tr -d '\n')"
fi

# The database lives in this stack, so its password is ours to invent. It is
# baked into the data volume when Postgres first initialises, so generate it
# only while no volume exists yet; afterwards whatever .env says must match.
PGVOL="$(env_val PGDATA_VOLUME || true)"; PGVOL="${PGVOL:-tasknest_pgdata}"
PGPW="$(env_val POSTGRES_PASSWORD || true)"
if [ -z "$PGPW" ] || [ "$PGPW" = "tasknest" ]; then
  if docker volume inspect "$PGVOL" >/dev/null 2>&1; then
    warn "POSTGRES_PASSWORD is the dev default but the $PGVOL volume already exists — keeping it so the API can still connect."
    [ -n "$PGPW" ] || set_env POSTGRES_PASSWORD tasknest
  else
    log "Generating POSTGRES_PASSWORD…"
    set_env POSTGRES_PASSWORD "$(openssl rand -hex 24)"
  fi
fi

# Postgres is published on localhost for psql/backups; the API reaches it over
# the internal network regardless. On a shared VPS the default port may be
# taken by another stack (cowrie has 5434, p2p-manager 5433), so pick the
# first free port from the configured one upwards. Our own running container
# doesn't count as a conflict — compose recreates it on the same port.
port_taken() {
  docker ps --format '{{.Names}} {{.Ports}}' | grep -v '^tasknest-postgres ' | grep -q ":$1->" && return 0
  if command -v ss >/dev/null 2>&1; then
    ss -ltnH 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1\$" \
      && ! docker ps --format '{{.Names}} {{.Ports}}' | grep '^tasknest-postgres ' | grep -q ":$1->" \
      && return 0
  fi
  return 1
}
PGPORT="$(env_val POSTGRES_HOST_PORT || true)"; PGPORT="${PGPORT:-5434}"
if port_taken "$PGPORT"; then
  ORIG="$PGPORT"
  while port_taken "$PGPORT"; do PGPORT=$((PGPORT + 1)); done
  warn "Host port $ORIG is in use by another service — publishing Postgres on 127.0.0.1:$PGPORT instead."
  set_env POSTGRES_HOST_PORT "$PGPORT"
fi

# Avatar and reset links are built from PUBLIC_URL; it must be the https
# address Caddy serves. This is the one value that needs a human.
PUBLIC="$(env_val PUBLIC_URL || true)"
case "$PUBLIC" in
  https://*) ;;
  *) die "PUBLIC_URL in .env must be the public https URL of this API (e.g. https://tasknest-server.example.com), got: '${PUBLIC:-<empty>}'." ;;
esac

if [ -z "$(env_val R2_ACCOUNT_ID || true)" ]; then
  warn "R2_* is not set — avatars will be stored on the tasknest_uploads volume instead of Cloudflare R2."
fi

# --- Optionally pull the latest code ----------------------------------------
if [ "$PULL" -eq 1 ]; then
  if git rev-parse --git-dir >/dev/null 2>&1; then
    log "Pulling latest code…"
    git pull --ff-only
  else
    warn "--pull requested but this isn't a git checkout; skipping."
  fi
fi

# --- Build & start ----------------------------------------------------------
# Keep the running image reachable as :previous so `./deploy.sh rollback` can
# restore it in one command if this build turns out bad.
if docker image inspect tasknest-api:latest >/dev/null 2>&1; then
  docker tag tasknest-api:latest tasknest-api:previous
fi

log "Building images…"
$COMPOSE build

log "Starting the stack…"
$COMPOSE up -d

# --- Wait for the API to report healthy -------------------------------------
if wait_healthy; then
  $COMPOSE ps
  if [ "$TAIL" -eq 1 ]; then
    exec $COMPOSE logs -f api
  fi
  exit 0
fi

warn "API did not become healthy within ~60s. Recent logs:"
$COMPOSE logs --tail=50 api
die "Deployment failed the health check — roll back with: ./deploy.sh rollback"
