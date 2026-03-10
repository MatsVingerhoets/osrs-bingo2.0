# OSRS Bingo 2.0

Phase 1 scaffolds the rewrite as a single [TanStack Start](https://tanstack.com/start) application with Tailwind CSS, ESLint, and explicit environment handling.

## Stack

- TanStack Start
- React 19
- Tailwind CSS 4
- TypeScript 5
- ESLint + Prettier

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000` inside the container, or `http://localhost:${APP_PORT}` from the host.

## Scripts

- `npm run dev` starts the TanStack Start dev server on port `3000`
- `npm run build` builds the production server and client bundles
- `npm run preview` serves the production build locally
- `npm run db:migrate` runs the Kysely migrations against `DATABASE_URL`
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript without emitting files
- `npm run check` runs lint and typecheck together
- `npm run format` runs Prettier across the repo

## Environment Variables

The devcontainer's `docker-compose.yml` already loads the root `.env` file. Phase 1 uses that same file for both container settings and app configuration.

### Required for Phase 1

| Variable | Description |
| --- | --- |
| `APP_NAME` | Human-readable app name used by the UI and metadata |
| `APP_DIR` | Workspace directory mounted by Docker Compose |
| `APP_PORT` | Host port mapped to the app container's port `3000` |
| `APP_BASE_URL` | Base URL for the app, usually `http://localhost:<APP_PORT>` |

### Defined now for later phases

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string for Kysely |
| `SESSION_SECRET` | Secret used to sign app sessions |
| `SESSION_MAX_AGE_SECONDS` | Max cookie-session lifetime in seconds |
| `KEYCLOAK_ISSUER_URL` | Keycloak realm issuer URL |
| `KEYCLOAK_CLIENT_ID` | OIDC client ID |
| `KEYCLOAK_CLIENT_SECRET` | OIDC client secret |
| `KEYCLOAK_USERNAME_CLAIM` | Username-style claim to map into the local `name` field |

These auth and database variables are parsed in a predictable location now, but they are not required for the Phase 1 app shell to boot.

## Project Structure

The app stays in a single TanStack Start project, with internal boundaries that match the architecture plan:

```text
src/
  domain/
  features/
    admin/
    auth/
    board/
    completions/
    events/
    teams/
  models/
  repositories/
  server/
    auth/
  lib/
    db/
    env/
    keycloak/
    session/
  routes/
```

## Notes

- `src/lib/env/public.ts` is the client-safe env surface.
- `src/lib/env/server.ts` is the server-only env surface.
- Future auth and database work should import those modules instead of reading `process.env` ad hoc.
- Phase 3 replaces the temporary file-backed auth store with a database-backed user repository.
