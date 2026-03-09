# OSRS Bingo 2.0 Architecture

## Purpose

This document describes the target technical shape of the rewrite. It is intentionally oriented around implementation planning rather than final code structure.

## Runtime

- Development runs in the current local containerized environment.
- Production runs as a Docker container with a Node.js server.
- Primary database is Postgres.
- Authentication is delegated to Keycloak using OIDC.
- Styling should use Tailwind CSS as the primary UI styling layer.
- Database access should use Kysely.
- Linting should use ESLint.

## Core Tooling

- Framework: TanStack Start
- Styling: Tailwind CSS
- Database access: Kysely
- Authentication: Keycloak OIDC
- Linting: ESLint

## Application Shape

The current recommendation is to start with a single TanStack Start application, not an immediate monorepo split.

Reasoning:

- TanStack Start supports server-side logic inside the app.
- The project scope is currently one app, one board, and one active event.
- Premature package extraction would add ceremony before boundaries are proven.

Internal code organization should still preserve clean boundaries:

- `src/features/auth`
- `src/features/events`
- `src/features/teams`
- `src/features/board`
- `src/features/completions`
- `src/features/admin`
- `src/lib/db`
- `src/lib/keycloak`
- `src/lib/session`
- `src/domain`

If the domain logic and data access stabilize cleanly, these areas can later be extracted into packages without changing core behavior.

## Authentication And Session Model

### External Identity

- Keycloak is the source of truth for authentication.
- The app uses OIDC browser redirects for login.
- The app receives identity claims and mapped roles from Keycloak.

### Local User Provisioning

On successful login:

1. Validate OIDC callback.
2. Resolve external user identity.
3. Create a local user row if none exists.
4. Update local roles based on Keycloak client roles.
5. Create or refresh the app session.

### Local Session

The app should maintain its own secure session after OIDC callback.

Reasoning:

- simpler request handling in the app
- cleaner route protection
- easier role checks and current-event resolution
- avoids re-validating the full OIDC token flow on every request

## Role Mapping

- `osrs_bingo_admin` -> `ADMIN`
- `osrs_bingo_user` -> `USER`
- no mapped role -> `['USER']`
- both roles present -> keep both mapped roles

The app should store the mapped roles array in the local user record for fast authorization checks while still treating Keycloak as the source of authority on login.

## Domain Model

The rewrite should not preserve the legacy schema as-is. The legacy model mixes user-scoped and team-scoped gameplay in ways that caused correctness issues.

### Recommended Core Entities

- `users`
- `events`
- `teams`
- `team_memberships`
- `boards`
- `board_tiles`
- `team_tile_completions`

### Recommended Relationships

- one current event can be `active`
- one user can have many memberships across events over time
- one user can have at most one team membership per event
- one event has many teams
- one event has one active board in the first release
- one board has many board tiles
- one team can complete each board tile at most once

## Schema Direction

### users

App-owned profile row synchronized from Keycloak.

Suggested fields:

- `id`
- `keycloak_subject`
- `username`
- `email`
- `roles`
- `created_at`
- `updated_at`

Notes:

- `keycloak_subject` should be unique.
- `roles` stores the resolved app authorization levels as an array.

### events

Suggested fields:

- `id`
- `name`
- `status`
- `start_time`
- `duration_minutes`
- `board_key`
- `created_at`
- `updated_at`

Notes:

- `status` is explicit and not derived.
- first release should enforce only one `active` event.

### teams

Suggested fields:

- `id`
- `event_id`
- `name`
- `created_at`
- `updated_at`

### team_memberships

This replaces the legacy direct `users.team_id` model.

Suggested fields:

- `id`
- `event_id`
- `team_id`
- `user_id`
- `created_at`
- `updated_at`

Constraints:

- unique `(event_id, user_id)`

Reasoning:

- supports one team per user per event
- avoids coupling user identity to a single permanent team
- keeps event scoping explicit

### boards

Suggested fields:

- `id`
- `event_id`
- `key`
- `name`
- `version`
- `layout_json`
- `created_at`

Notes:

- `layout_json` stores the canonical import/export artifact.
- runtime queries should not rely only on this JSON.

### board_tiles

Suggested fields:

- `id`
- `board_id`
- `tile_key`
- `label`
- `info_url`
- `color_tier`
- `points`
- `adjacent_tile_keys`
- `row_index`
- `column_index`
- `created_at`

Reasoning:

- keeps runtime queries straightforward
- makes scoring, filtering, and board resolution easier than opaque JSON-only storage
- preserves the fixed board dataset in normalized form

### team_tile_completions

Canonical completion record for gameplay.

Suggested fields:

- `id`
- `event_id`
- `team_id`
- `board_tile_id`
- `completed_by_user_id`
- `proof_url`
- `completed_at`
- `invalidated_at`

Constraints:

- unique active completion per `(team_id, board_tile_id)`

Implementation note:

- soft invalidation is used in the first release
- uniqueness must account for only non-invalidated rows

## Board Data Strategy

The board definition should exist in two forms:

- source artifact: canonical TypeScript file derived from the legacy dataset
- runtime records: normalized `boards` and `board_tiles` rows

Canonical legacy source reference:

- `https://github.com/MatsVingerhoets/osrs-bingo/blob/main/src/data/tiles.ts`

Recommended flow:

1. Keep the board definition under source control.
2. Validate it at import time.
3. Create board and tile rows from that source when creating an event.
4. Treat the stored board for an event as immutable after activation.

This keeps editing simple while avoiding JSON-only query logic in production code.

## Server-Side Behavior

### Route Protection

- public routes: OIDC login entry, callback, logout landing pages as needed
- protected routes: player board
- admin-only routes: event setup, team management, completion inspection

### Server Functions

TanStack Start server functions should cover:

- auth callback handling
- current-user/session loading
- event creation and status transitions
- team CRUD
- team membership assignment
- board loading
- tile completion submission
- completion inspection queries
- completion invalidation

## Derived Read Models

The app should derive, not persist:

- team score
- per-user contribution score
- visible tile set
- team standings

Reasoning:

- avoids stale counters
- keeps invalidation behavior correct
- makes the completion table the single gameplay source of truth

If performance later requires caching, that can be introduced after correctness is proven.

## Event Lifecycle

### draft

- event metadata is editable
- teams can be created and populated
- board can be attached

### active

- board is locked
- users can submit completions
- team membership can still change

### completed

- gameplay is closed
- standings remain viewable

### archived

- record retained for future history support
- not required for first-release UI

## Admin Inspection Model

The admin completion table should support:

- filtering by team
- filtering by user
- filtering by tile
- sorting by completion time
- opening proof URLs directly
- invalidating bad completions

This should be built on top of queryable completion and membership tables, not inferred from denormalized snapshots.

## Implementation Plan

1. Bootstrap TanStack Start app with Postgres connectivity and environment handling.
2. Implement Keycloak OIDC login, callback, logout, and local session handling.
3. Define the database schema for users, events, teams, memberships, boards, board tiles, and team completions.
4. Import the fixed board dataset from the canonical source artifact.
5. Build pure domain functions for visibility and score derivation.
6. Implement current event resolution and protected player board loader.
7. Implement team-scoped tile completion submission with uniqueness guarantees.
8. Build the player board UI with hidden, unlocked, and completed states.
9. Build admin event setup flow with explicit status transitions.
10. Build team management and user assignment UI.
11. Build admin completion inspection and invalidation UI.
12. Add tests around visibility, scoring derivation, role mapping, and completion uniqueness.

## Testing Priorities

- Keycloak role mapping and auto-provisioning
- one-team-per-user-per-event constraint
- one-completion-per-team-per-tile constraint
- visibility recomputation after valid completion
- visibility recomputation after invalidation
- score derivation from completion data
- admin route protection

## Open Technical Questions

- whether to keep a lightweight single app permanently or later extract packages
- exact Keycloak claim fields to use during local user provisioning
