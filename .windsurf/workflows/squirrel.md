## Squirrel Workflow — Modern Auth (2026) for this repo

### What this platform needed (and we implemented)
- **Passkeys (WebAuthn)**: phishing-resistant primary sign-in.
- **Magic links**: email fallback (short TTL, single-use).
- **Clean migrations runner**: `npm run db:migrate` now exists and applies `server/database/schema.sql` + `server/migrations/*.sql`.
- **JWT hardening**: `JWT_SECRET` is required (no insecure defaults).

### Critical env vars (server)
- **`DATABASE_URL`**: Postgres connection string.
- **`CLIENT_URL`**: canonical frontend origin (used by CORS + magic link redirect + WebAuthn expected origin).
- **`JWT_SECRET`**: required; used to sign/verify JWTs.
- **`PASSKEY_RP_ID`**: passkey relying party ID.
  - Dev: `localhost`
  - Prod: your domain, e.g. `bloghub.com` (no scheme/path)
- **`PASSKEY_RP_NAME`**: display name shown by authenticators.

### Architecture decision (before OAuth)
Auth is now feature-scoped in:
- `server/features/auth/auth.routes.js`
- `server/features/auth/auth.config.js`
- `server/services/auth.service.js`

Rule: **routes call services + DB, JWT schema is unified**, and WebAuthn config comes from one config module.

### Review checklist (auth PRs)
- No token secrets or magic-link tokens in prod logs.
- One JWT schema across server+client (`{ id, email, username, role }`).
- `CLIENT_URL`/`PASSKEY_RP_ID` match the deployed domain/origin exactly.
- Rate limits exist for login/register/magic-link/passkey endpoints.