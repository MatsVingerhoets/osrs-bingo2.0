# OSRS Bingo 2.0 Design

## Purpose

This document defines the product behavior and user experience for the `2.0` rewrite of the OSRS Honeycomb Bingo app. It is intentionally stricter than the legacy implementation and should be used as the reference for planning and implementation.

## Product Goals

- Support a team-vs-team OSRS bingo event on a fixed honeycomb board.
- Use Keycloak OIDC for authentication and external identity management.
- Keep app-owned game state in the app database.
- Use Tailwind CSS as the primary styling system.
- Optimize for admin control, clear board state, and low operational overhead during live events.
- Improve correctness over the legacy app rather than preserving known defects.

## Non-Goals

- Multiple concurrent active events.
- In-app image hosting or upload handling.
- Blocking proof moderation before a tile counts.
- Team self-management by team leads in the first release.
- Full historical event browsing in the first release.

## User Types

- `ADMIN`
  - Can create and manage the event.
  - Can assign users to teams.
  - Can inspect and invalidate completions.
  - Can view the admin panel and operational event data.
- `USER`
  - Can sign in through Keycloak.
  - Can view their team's board when assigned.
  - Can submit proof URLs for unlocked tiles.

## Identity And Roles

- Authentication is handled by Keycloak through OIDC redirect flow.
- On first successful login, the app auto-provisions a local user record.
- The app stores a local user row for app-owned state and relationships.
- Keycloak roles map into app roles:
  - `osrs_bingo_admin` -> `ADMIN`
  - `osrs_bingo_user` -> `USER`
- If a user has no mapped Keycloak role, the app assigns `USER`.
- If a user has both roles, the app treats them as `ADMIN`.

## Event Model

- Only one event is active at a time.
- Event statuses are explicit:
  - `draft`
  - `active`
  - `completed`
  - `archived`
- The board definition is fixed once the event starts.
- Team membership may still be adjusted during an active event.

## Board Design

### Fixed Board

- The first release ships with one canonical OSRS honeycomb board.
- Board structure comes from the canonical tile dataset from the legacy project.
- Canonical tile dataset reference: `https://github.com/MatsVingerhoets/osrs-bingo/blob/main/src/data/tiles.ts`
- The board is not editable during an active event.

### Geometry

- The board uses 12 rows.
- Tile counts per row: `6,7,8,9,10,11,12,11,10,9,8,7`.
- Row shift values: `6,5,4,3,2,1,0,1,2,3,4,5`.
- The board should preserve the visual honeycomb layout from the existing game.

### Tile Definition

Each tile conceptually includes:

- stable tile identifier
- label
- external info URL
- point value
- color tier
- adjacency metadata
- board position metadata

### Unlock Rules

- Initial visible tiles are `46`, `57`, and `58`.
- Completed tiles remain visible.
- An incomplete tile becomes visible when adjacent to a completed tile.
- Hidden tiles are non-interactive.

### Tile States

- `hidden`
  - Tile is not yet unlocked.
  - User cannot interact with it.
- `unlocked`
  - Tile is visible and available for completion.
  - User can open the completion modal.
- `completed`
  - Tile is visible as completed for the team.
  - User can open the completion details view.

## Scoring

- Team score is derived from completions, not stored as a mutable counter.
- User contribution views are informational only.
- Team standings are the authoritative competitive ranking.
- Rules described in the legacy UI but not implemented in code remain out of scope for the first build:
  - ring completion doubles ring points
  - first gold ring grants extra `32`
  - anti-tampering review workflow

## Player Experience

### Login

- Unauthenticated users are redirected into the Keycloak login flow.
- After successful login, the app creates or updates the local user record and role mapping.

### Team Assignment

- A signed-in user may exist in the system without a team assignment.
- If the user is not assigned to a team for the current event, the app shows a clear non-game state rather than a broken board.

### Main Board Flow

1. User signs in through Keycloak.
2. App resolves the current event and the user's team membership.
3. App loads the board and the team's completion state.
4. User sees hidden, unlocked, and completed tiles.
5. User submits a proof URL for an unlocked tile.
6. Completion counts immediately.
7. Board visibility and team score recompute from canonical completion data.

### Completion Submission

- Proof submission is URL-based only.
- Users paste an externally hosted image URL.
- Successful submission immediately counts for the team.
- The app records which user submitted the tile.

## Admin Experience

### Admin Dashboard Scope

The admin panel should support:

- current event overview
- event setup and launch flow
- team management
- user assignment to teams
- completion inspection
- completion invalidation

### Event Setup Flow

The intended admin flow is:

1. Create event.
2. Configure metadata.
3. Assign users to teams.
4. Review readiness.
5. Start event.

The minimum event setup fields are:

- event name
- start time
- duration
- canonical board selection

### Team Management

- Teams are managed inside the app, not in Keycloak.
- Admins assign users to teams.
- Team membership can be changed even during an active event.
- Historical completions remain attributed to the original submitting user even if that user later moves or is removed.

### Completion Inspection

Admins need a completion table with:

- submitted by user
- team
- tile
- proof URL
- completion timestamp
- filters

The inspection UI is operational tooling, not a moderation gate.

### Completion Invalidation

- Admins can invalidate a recorded completion.
- Invalidation immediately removes the completion from scoring.
- Invalidation immediately recomputes board visibility from the remaining valid completions.

## Design Principles

- Preserve the distinctive honeycomb board identity.
- Keep player interactions fast and obvious during live play.
- Prefer operational clarity over feature breadth.
- Make admin flows explicit instead of hiding setup behind seed-like actions.
- Separate player-facing gameplay from admin inspection concerns.

## Future Enhancements

- historical event browsing
- reusable board templates
- team-lead self-service membership
- richer player contribution views
- optional proof review workflow
- implementation of ring-based bonus scoring
