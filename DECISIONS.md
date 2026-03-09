# OSRS Bingo 2.0 Decisions

## Accepted Decisions

### Product Scope

- This rewrite is an improved `2.0`, not a defect-for-defect clone.
- Only one event is active at a time.
- Historical event browsing is out of scope for the first release.
- The first release uses one canonical OSRS honeycomb board.
- The canonical board source currently lives at `https://github.com/MatsVingerhoets/osrs-bingo/blob/main/src/data/tiles.ts`.
- Tailwind CSS is the primary styling approach.

### Authentication

- Authentication uses Keycloak OIDC.
- The app auto-provisions a local user on first successful login.
- The app stores a local user model for app-owned data and relationships.
- Keycloak roles are synchronized into the app roles array on login.
- The app keeps separate local fields for `keycloakId`, `username`, and `email`.
- The app does not use a separate `display_name` field in the first auth pass.

### Role Mapping

- `osrs_bingo_admin` maps to `ADMIN`.
- `osrs_bingo_user` maps to `USER`.
- No mapped role defaults to `['USER']`.
- Roles are read from Keycloak client roles only.
- A user with both mapped roles keeps both roles in the local roles array.

### Team Model

- Teams are managed inside the app, not inside Keycloak.
- In the first release, only admins assign users to teams.
- A user may belong to exactly one team per event.
- Team membership can be adjusted while an event is active.

### Event Model

- Event statuses are explicit: `draft`, `active`, `completed`, `archived`.
- The board becomes immutable once the event starts.
- The setup flow is explicit and admin-driven, not a hidden seed-style action.
- Archived events are not needed for the first release beyond keeping the status value available.

### Completion Model

- Completions are team-scoped.
- The app records which user submitted the completion.
- Team score is authoritative.
- Per-user contribution is informational only.
- Proof submission uses externally hosted image URLs.
- Completion counts immediately on submit.
- Admins can inspect and invalidate completions later.
- Completion invalidation uses soft delete semantics.

### Documentation

- Documentation is split into:
  - `DESIGN.md`
  - `ARCHITECTURE.md`
  - `DECISIONS.md`

### Core Tooling

- The app should use Tailwind CSS for styling.
- The app should use Kysely for database access.
- The app should use ESLint for linting.
- The canonical board source in the new repo should remain TypeScript.

## Recommended Decisions

These are not user-rejected and currently represent the strongest implementation direction.

### App Structure

- Start with a single TanStack Start app.
- Preserve separation through internal folders and domain modules.
- Extract packages later only if the boundaries prove useful.

Reasoning:

- TanStack Start can handle server logic without a monorepo.
- The current scope does not justify package overhead yet.

### Database Shape

- Use explicit membership and team completion tables.
- Do not keep the legacy `users.team_id` coupling.
- Do not make board runtime behavior depend on JSON-only storage.

Reasoning:

- the legacy model mixed user-scoped and team-scoped gameplay
- the rewrite needs correctness around unique team completion and event scoping

### Score Storage

- Derive scores from completion records instead of persisting counters.

Reasoning:

- invalidation becomes correct by construction
- avoids stale or conflicting counters

## Deferred Decisions

These should be revisited during implementation but do not block planning.

### Future Packaging

Options:

- keep single app
- extract `domain` and `db` into packages later

Current leaning:

- defer extraction until there is real reuse or maintenance pressure

## Rejected Directions

- using Keycloak to manage teams
- persisting team score as the primary source of truth
- supporting concurrent events in the first release
- implementing blocking proof moderation in the first release
- making the board editable after the event starts
- requiring admins to inspect proof URLs directly in the database

## Outstanding Questions

- Exact Keycloak username-style claim to use for local `username`.
