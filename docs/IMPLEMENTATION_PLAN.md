# OSRS Bingo 2.0 Implementation Plan

## Purpose

This document converts the current product and architecture decisions into an execution plan for implementation. It is intended to be used as the working plan while building the application.

## Planning Assumptions

- The rewrite targets TanStack Start.
- The app runs locally in the current dev container environment.
- Production runs in Docker with a Node.js server.
- Authentication uses Keycloak OIDC.
- Styling uses Tailwind CSS.
- Database access uses Kysely with Postgres.
- Linting uses ESLint.
- The first release supports one active event at a time.
- The first release uses one canonical fixed honeycomb board.
- Team gameplay is the source of truth; per-user scoring is informational only.

## Cross-Cutting Conventions

- prefer Tailwind utility classes for application styling
- use `src/styles.css` only for global concerns such as Tailwind imports, theme tokens, fonts, and browser-wide base rules
- add custom CSS only when the result cannot be expressed cleanly with Tailwind utilities or would be materially harder to maintain
- when custom CSS is necessary, keep it small, explicit, and local to the actual constraint

## Delivery Strategy

Build the app in narrow vertical slices, starting with infrastructure and correctness-critical flows first.

Implementation order should prioritize:

1. environment and scaffolding
2. authentication and session handling
3. schema and data modeling
4. board import and pure domain logic
5. player-facing core gameplay
6. admin workflows
7. verification and hardening

## Phase 1: Project Scaffold

### Goal

Create the base TanStack Start application with the agreed core tooling and development conventions.

### Tasks

- initialize the TanStack Start app
- set up TypeScript configuration
- set up ESLint
- set up Tailwind CSS
- define environment variable handling
- define local development scripts
- document required env variables in the project README or env example

### Dependencies

- none

### Acceptance Criteria

- app boots locally
- linting runs successfully
- Tailwind styling is wired into the app
- environment variables are loaded in a predictable way
- the project structure matches the agreed architecture direction

### Risks

- choosing plugin/config combinations that fight TanStack Start defaults
- leaving auth and DB config too implicit too early

## Phase 2: Authentication And Session Foundation

### Goal

Establish Keycloak OIDC login and a stable local session model.

### Tasks

- define auth-related environment variables
- implement OIDC login entry flow
- implement callback handling
- implement local user auto-provisioning on first login
- implement role mapping from Keycloak roles to app roles
- implement local session persistence after successful login
- implement logout flow
- add route protection helpers for authenticated and admin-only areas

### Dependencies

- Phase 1

### Acceptance Criteria

- unauthenticated users are redirected into login flow
- successful Keycloak login creates a local user if one does not exist
- user roles are resolved from Keycloak client roles on login
- missing mapped roles default to `['USER']`
- admin-only routes reject non-admin users

### Risks

- unclear Keycloak claims structure
- mismatched role claim parsing
- mixing OIDC state handling with app session logic too early

### Notes

- map `keycloak_id` from the Keycloak `sub` claim
- use local user fields `keycloak_id`, `name`, and `email`
- keep the auth integration minimal at first; avoid feature creep into identity management
- store local app roles as an array rather than a single resolved role

## Phase 3: Database Schema And Persistence Layer

### Goal

Create the initial schema and typed data access layer aligned with the `2.0` domain model.

### Tasks

- create Kysely database setup
- create migrations for `users`
- create migrations for `events`
- create migrations for `teams`
- create migrations for `team_memberships`
- create migrations for `boards`
- create migrations for `board_tiles`
- create migrations for `team_tile_completions`
- add indexes and uniqueness constraints
- create typed query helpers or repositories for each feature area

### Dependencies

- Phase 1

### Acceptance Criteria

- migrations run successfully on a fresh database
- one user can belong to only one team per event
- one team can complete each tile at most once
- local user records support unique Keycloak `sub` mapping and unique emails
- the data access layer is typed and usable by server functions

### Risks

- overly generic schema makes feature work slower

## Phase 4: Canonical Board Import

### Goal

Bring the fixed honeycomb board into the new system as a canonical source artifact plus runtime records.

### Tasks

- record the canonical source reference from the legacy project
- define a validated internal board format
- implement a board import path for event creation
- store board layout metadata and normalized tiles in the database
- verify row counts, shifts, adjacency, color tiers, and point values

### Dependencies

- Phase 3

### Acceptance Criteria

- the canonical board can be imported repeatably
- imported board data matches expected tile count and geometry
- tile records are queryable without relying on opaque JSON-only reads

### Risks

- accidental drift from the legacy tile dataset
- mismatch between source IDs and runtime tile identifiers

### Canonical Source

- `https://github.com/MatsVingerhoets/osrs-bingo/blob/main/src/data/tiles.ts`

## Phase 5: Domain Logic Extraction

### Goal

Implement the core gameplay rules as pure, testable domain functions.

### Tasks

- implement `getInitialVisibleTiles`
- implement visibility computation from completed tiles and adjacency
- implement team score derivation from completions
- implement per-user contribution derivation for informational views
- define domain helpers for event-state gating

### Dependencies

- Phase 4

### Acceptance Criteria

- visibility logic matches the intended board behavior
- team score is derived correctly from completion data
- invalidating a completion recomputes visible tiles and score correctly
- domain functions can be tested without UI or DB dependencies

### Risks

- hidden coupling between tile source format and runtime domain logic
- future bonus scoring rules complicating a too-rigid API

## Phase 6: Current Event Resolution

### Goal

Create the server-side read path that resolves the current event context for authenticated users.

### Tasks

- implement current event lookup by status
- implement current user resolution from session
- implement membership lookup for the current event
- implement board and tile loading for the user's team
- implement empty-state handling for users without a team

### Dependencies

- Phase 2
- Phase 3
- Phase 5

### Acceptance Criteria

- authenticated users can resolve into the current event context
- users without a team see a clear non-game state
- team board state loads without duplicate or ambiguous tile rows

### Risks

- route loaders coupling too tightly to rendering
- weak event scoping causing wrong data joins

## Phase 7: Player Board Experience

### Goal

Build the main gameplay surface for players.

### Tasks

- implement the honeycomb board layout in the new app
- render hidden, unlocked, and completed tile states
- implement tile interaction behavior
- implement proof URL submission UI
- implement completion submission server function
- recompute and return updated board state after successful completion
- display team score and minimal team context

### Dependencies

- Phase 5
- Phase 6

### Acceptance Criteria

- board visually reflects the intended geometry
- hidden tiles are non-interactive
- unlocked tiles accept proof submission
- completed tiles render a completion state
- completion submission updates the team board correctly

### Risks

- optimistic UI adding complexity before core correctness is stable
- CSS/layout drift from the intended honeycomb structure

## Phase 8: Admin Event Setup

### Goal

Replace the seed-style game creation flow with an explicit admin setup flow.

### Tasks

- implement admin dashboard shell
- implement event creation form
- implement event status transitions
- attach the canonical board to the event
- implement readiness-oriented setup screens
- prevent board mutation after activation

### Dependencies

- Phase 2
- Phase 3
- Phase 4

### Acceptance Criteria

- admins can create a draft event
- admins can configure required event fields
- admins can activate the event
- once active, the board definition cannot be altered

### Risks

- unclear status transition rules
- setup UI trying to do too much in one screen

## Phase 9: Team And Membership Management

### Goal

Provide admin control over teams and event membership.

### Tasks

- implement team creation
- implement team list and detail views
- implement assignment of users to teams for the current event
- implement unassigned-user views
- enforce one-team-per-user-per-event at the application layer

### Dependencies

- Phase 2
- Phase 3
- Phase 8

### Acceptance Criteria

- admins can create teams for the event
- admins can assign and move users between teams
- users can remain unassigned until an admin places them
- membership changes do not rewrite historical completion attribution

### Risks

- accidental assumptions that user membership is global rather than event-scoped

## Phase 10: Admin Completion Inspection And Correction

### Goal

Give admins operational visibility into proof submissions and the ability to invalidate them.

### Tasks

- implement completion table UI
- add filters for user, team, tile, and time
- show proof URLs directly in the table or detail view
- implement invalidation action
- recompute affected board state and scores after invalidation

### Dependencies

- Phase 7
- Phase 9

### Acceptance Criteria

- admins can inspect submissions without DB access
- admins can find submissions by team, user, or tile
- invalidation immediately affects team board state and scoring

### Risks

- invalidation behavior becoming inconsistent if score/state derivation is not purely read-based

## Phase 11: Quality Gates

### Goal

Add the minimum verification needed to trust the app during a live event.

### Tasks

- add automated tests for auth role mapping
- add tests for one-team-per-user-per-event constraint
- add tests for one-completion-per-team-per-tile constraint
- add tests for visibility derivation
- add tests for invalidation behavior
- add tests for admin route protection
- run linting and typechecking in CI or equivalent local commands

### Dependencies

- Phases 2 through 10

### Acceptance Criteria

- critical domain logic is covered by tests
- the main auth and authorization rules are validated
- the app passes linting and typechecking consistently

### Risks

- focusing only on UI behavior and under-testing the domain layer

## Suggested First Build Order

If work needs to begin immediately, the highest-leverage first sequence is:

1. scaffold the TanStack Start app with Tailwind, ESLint, and Kysely
2. wire env handling and Postgres connectivity
3. implement Keycloak login and callback flow
4. create the initial schema and migrations
5. import the canonical board dataset
6. implement pure visibility and score derivation
7. build the authenticated player board loader
8. build completion submission
9. build admin event setup
10. build team management
11. build completion inspection and invalidation
12. harden with tests

## Parallelization Guidance

Parallel work is useful only after foundational assumptions are fixed.

Safe parallel tracks after the scaffold exists:

- auth integration and session handling
- schema and migration drafting
- board data transformation and import validation
- pure domain logic for visibility and scoring

Work that should stay coordinated by one primary implementer:

- final schema choices
- session and route protection model
- event lifecycle behavior
- completion invalidation semantics

## Open Questions To Resolve During Implementation

- none currently

## Definition Of Ready For Coding

Implementation can start once the following are accepted:

- docs reflect the intended product behavior
- schema direction is acceptable
- auth direction is acceptable
- the first-build sequence is accepted
- the remaining open questions are small enough to resolve during implementation without blocking the scaffold
