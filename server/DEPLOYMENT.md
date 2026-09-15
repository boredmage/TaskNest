# Deploying the TaskNest API

This deploys the Bun/Hono API + Postgres on the shared Linux VPS with Docker,
behind the global Caddy container. The API is published on **port 8787**.

The stack is three containers, defined in [`docker-compose.yml`](./docker-compose.yml):

| Container            | Image                 | Reachable on                 | Purpose               |
| -------------------- | --------------------- | ---------------------------- | --------------------- |
| `tasknest-api`       | built from Dockerfile | `web` net + `127.0.0.1:8787` | Bun/Hono API          |
| `tasknest-postgres`  | `postgres:16-alpine`  | `127.0.0.1:5435` (private)   | Database              |
| `tasknest-db-backup` | `postgres:16-alpine`  | (nothing)                    | nightly `pg_dump`s    |

The API joins the existing external **`web`** Docker network so Caddy can
reverse-proxy to it as `tasknest-api:8787` (TLS terminates at Caddy). It is
_also_ bound to `127.0.0.1:8787` on the host for the deploy-script health
check. Postgres sits on a private `internal` network, reachable only by the
API; its host port is 5435 so it coexists with p2p-manager (5433) and cowrie
(5434).

Schema migrations live in `drizzle/` and are applied automatically when the
API starts. Avatars go to Cloudflare R2 when the `R2_*` variables are set;
otherwise they land on the `tasknest_uploads` volume and are served by the
API from `/uploads`.

---

## 1. Prerequisites (on the VPS)

Docker, the compose plugin and the `web` network already exist if cowrie or
p2p-manager is deployed there. Otherwise:

```bash
curl -fsSL https://get.docker.com | sh
docker network create web 2>/dev/null || true
```

## 2. Get the code onto the VPS

```bash
cd /root
git clone https://github.com/boredmage/TaskNest.git
cd TaskNest/server
```

The workflow assumes the checkout is at `/root/TaskNest`; change the `cd` in
`.github/workflows/deploy.yml` if you put it elsewhere.

## 3. Configure `.env`

```bash
cp .env.example .env
```

Only one value needs a human: `PUBLIC_URL`, the https hostname Caddy will
serve (`deploy.sh` refuses to run without it). Set the five `R2_*` values
too so avatars go to Cloudflare R2 rather than a local volume.

```ini
PUBLIC_URL=https://tasknest-server.qlabs.agency
POSTGRES_HOST_PORT=5435        # 5434 is taken by cowrie on the shared VPS
R2_ACCOUNT_ID=…
R2_ACCESS_KEY_ID=…
R2_SECRET_ACCESS_KEY=…
R2_BUCKET=tasknest
R2_PUBLIC_URL=https://pub-….r2.dev
```

Everything else is handled by `deploy.sh` on the first run: it sets
`NODE_ENV=production` and generates `JWT_SECRET` and `POSTGRES_PASSWORD`,
writing them back into `.env` so later deploys reuse them. The database runs
inside this stack, so nothing about it has to be typed in. `DATABASE_URL` in
`.env` is ignored inside Docker; compose points the API at the `db`
container. `RESEND_API_KEY` and `EXPO_ACCESS_TOKEN` are optional.

## 4. Deploy

```bash
chmod +x deploy.sh
./deploy.sh --logs
```

`deploy.sh` builds the image, starts the stack, waits for `/health`, and
keeps the previous image as `tasknest-api:previous`.

```bash
./deploy.sh --pull      # pull + rebuild + restart (what the workflow runs)
./deploy.sh rollback    # back to the previous image
./deploy.sh down        # stop; data volumes are kept
docker compose logs -f api
```

## 5. Caddy

Add this site block to the global Caddyfile (Caddy is on the `web` network,
so the container name resolves):

```
tasknest-server.qlabs.agency {
    reverse_proxy tasknest-api:8787
}
```

Then reload Caddy:

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
# or, if that errors:  docker restart caddy
```

Point an `A` record for the hostname at the VPS; Caddy fetches a certificate
on the first request. WebSockets (the `/v1/realtime` route) work through
`reverse_proxy` with no extra config. Verify:

```bash
curl https://tasknest-server.qlabs.agency/health
```

Then set `EXPO_PUBLIC_API_URL=https://tasknest-server.qlabs.agency/v1` in the
mobile app's env for production builds.

## 6. GitHub Actions

`.github/workflows/deploy.yml` typechecks, builds the image, then SSHes in
and runs `./deploy.sh --pull` on every push to `main` that touches
`server/`. Add these repository secrets: `VPS_HOST`, `VPS_USER`,
`VPS_SSH_KEY` (private key whose public half is in the VPS's
`authorized_keys`). The same values as the other two projects work.

## Backups

The `tasknest-db-backup` container writes a `pg_dump` custom-format snapshot
to `server/backups/` every 24h and keeps the newest 14. Copy them off the VPS
too. Restore:

```bash
docker compose exec -T db pg_restore -U tasknest -d tasknest --clean --if-exists < backups/tasknest-<ts>.dump
```

## Local development

Only Postgres runs in Docker locally; the API runs with `bun run dev`:

```bash
bun run db:up          # docker compose up -d db  (host port 5434)
bun run dev
```
