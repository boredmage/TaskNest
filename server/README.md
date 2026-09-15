# TaskNest server

Hono + Bun API that replaces the Supabase backend for the TaskNest mobile app.
Postgres via Drizzle ORM, JWT auth with rotating refresh tokens, avatar
uploads on local disk, Expo push notifications, and a background sweep that
marks todos overdue.

## Run locally

```sh
cd server
cp .env.example .env            # then set JWT_SECRET (openssl rand -base64 48)
bun install
bun run db:up                   # Postgres 16 in Docker on 127.0.0.1:5434
bun run dev                     # migrates on boot, serves http://localhost:8787
```

`bun run dev` applies pending migrations from `drizzle/` on startup. After
changing files in `src/db/schema/`, run `bun run db:generate` to create the next
migration file and commit it.

Point the mobile app at the server with `EXPO_PUBLIC_API_URL` in
`mobile/.env`. On a simulator `http://localhost:8787` works; on a physical
device use your machine's LAN IP (for example `http://192.168.1.20:8787`) and
set the same value as `PUBLIC_URL` here so avatar URLs resolve on the phone.

## Layout

```
src/
  index.ts          Bun.serve entry: migrations, overdue sweeper, shutdown
  app.ts            Hono app, /v1 routes, /uploads static mount, error envelope
  env.ts            zod-validated environment
  db/schema/        Drizzle schema, one file per domain (users, families, todos, notifications)
  lib/              jwt, password (argon2id), tokens, push (Expo), mailer (Resend/log)
  middleware/auth   Bearer token guard -> c.get("userId")
  services/         auth, profiles, families, todos, notifications (all business rules)
  routes/           thin Hono routers with zod validation
  jobs/overdue.ts   timer that flips in_progress -> overdue and notifies
```

Authorization that used to live in Row Level Security policies and
`SECURITY DEFINER` RPCs now lives in `src/services/*`: every read and write
is scoped to the authenticated user or their family membership.

## Errors

Every error is `{ "error": { "code", "message", "details?" } }`. Codes the
client switches on: `invalid_credentials`, `user_already_exists`,
`token_expired`, `invalid_refresh_token`, `validation_error`, `invalid_otp`,
`already_in_family`, `already_member`, `forbidden`, `not_found`.

## API (all under `/v1`)

Auth (no token):
- `POST /auth/sign-up` `{email,password}` -> `{user, session}` (201)
- `POST /auth/sign-in` `{email,password}` -> `{user, session}`
- `POST /auth/refresh` `{refresh_token}` -> `{user, session}` (rotates; reuse revokes all)
- `POST /auth/password/forgot` `{email}` -> emails/logs a 6-digit code
- `POST /auth/password/verify` `{email, code}` -> `{reset_token}`
- `POST /auth/password/reset` `{reset_token, password}`

Auth (bearer):
- `POST /auth/sign-out` `{refresh_token?, everywhere?}`
- `GET /auth/me`
- `POST /auth/password/change` `{current_password, new_password}`

Profiles:
- `GET /profiles/me`, `PATCH /profiles/me` `{full_name?, avatar_url?, date_of_birth?}`
- `POST /profiles/me/avatar` multipart field `file` -> `{path, url}`
- `GET /profiles/:id` and `GET /profiles?ids=a,b` -> public `{id, full_name, avatar_url}`
- `GET /uploads/avatars/<file>` serves the image

Families:
- `GET /families/me` -> family with `members[]` or `null`
- `POST /families` -> new family (caller becomes owner)
- `POST /families/join-requests` `{invite_code}`
- `POST /families/join-requests/:id/approve|decline` (owner or admin)
- `POST /families/invites` `{email}` (owner only)
- `POST /families/invites/:id/respond` `{accept}` (invitee)

Todos:
- `GET /todos` (personal + family todos, due date asc nulls last, newest first)
- `POST /todos` `{title, description?, category?, due_date?, scope?, family_id?, assignee_ids?}`
- `PATCH /todos/:id` any of the above plus `status`
- `DELETE /todos/:id` (owner only)

Notifications:
- `GET /notifications?limit=50`, `PATCH /notifications/:id` `{data?, read_at?}`, `POST /notifications/read-all`
- `GET|PUT /notification-preferences` `{preferences: {newTaskAssigned, taskCompleted, ...}}`
- `PUT /push-tokens` `{token, platform}`, `DELETE /push-tokens` (`{token}` optional; no body removes all)

## Notification fan-out

| Event | Recipients | Type |
| --- | --- | --- |
| Join request submitted | family owner + admins | `join_request_received` |
| Join request approved | requester | `join_request_approved` |
| Invite sent | invitee | `family_invite_received` |
| Invite accepted | inviter + owner/admins | `family_invite_accepted` |
| Todo created/edited with assignees | new assignees | `todo_assigned` |
| Todo marked completed | owner + assignees (not the actor) | `todo_completed` |
| Overdue sweep | owner + assignees | `todo_overdue` |

The in-app row is always written; a user's preferences only suppress the push.

## Migrating data from Supabase

The schema keeps Supabase's table and column names, so a `pg_dump` of the old
`public` schema can be reloaded with small edits. What differs:

- `auth.users` -> `public.users(id, email, password_hash)`. Supabase's
  bcrypt hashes are not compatible with this server's argon2id verifier, so
  either have users reset their passwords or add a bcrypt fallback in
  `src/lib/password.ts` before importing `encrypted_password`.
- Avatars live in `UPLOADS_DIR/avatars/`; copy the objects out of the
  `avatars` storage bucket and keep the same relative paths.
- `family_join_requests.status` gains a `declined` value (declines used to delete the row).
