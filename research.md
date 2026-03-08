 writes `session.user = {id, username, role, team_id}`
  - redirects to `/`
- Logout via server action form: `src/app/LogoutForm.tsx`
 Teams overview:
  - list teams
  - open create team modal
  - open team details modal (assign users + board)
-ard/page.tsx`: admin dashboard

### App helpers
 on control
- `src/components/TileModal.tsx`: completion submission
- `src/components/TileOverviewModal.tsx`: completion details
-js`: dbmate migration helper script

### SQL/seeds
 e user record when joining completions, so multi-user teams can produce duplicated tile rows and odd completion semantics.

4. **Tile completion uniqueness is not enforced**
   - `tile_completions` table has no unique `(tile_id, team/event)` guard.
  d:
   - `npm run seedAdmin`
   - `npm run seedBoard`
  am_id, tile_id)`.
- Read board state by team directly.
- Optionally add `events` scoping in all major tables.
  (despite being in rules text)

Rules modal describes:

- ruild`  
Result: failed due invalid Next config (`next.config.ts` turbopack rule object).

Thiing, behavior mapping above is still accurate from source.s should be fixed only if you want this repo to continue as runnable reference; for migration planning completion doubles ring points
- first gold ring tile gives extra 32
- anti-tampering image review workflow

These are **not implemented** in server scoring or DB logic right now.

## 13) Immediate migration order (practical)

1. Recreate DB schema in new repo with corrected completion model.
2. Port tile dataset and board config unchanged.
3. Port auth/session + role-based route guards.
4. Port player flow (`/`, tile completion, unlock visibility).
5. Port admin flow (teams/users/board assignment + create game).
6. Add tests for unlock logic and completion uniqueness.
7. Add scoring engine only after base parity is stable.

## 14) Build validation snapshot from this audit

Command run: `npm run b
### Game-rule extraction (important)

Move these into pure functions (shared server/client where safe):

- `getInitialVisibleTiles` (`46,57,58` currently)
- `computeVisibility(completedTileIds, adjacencyMap)`
- `scoreForTile(tile)`
- future ring-bonus logic (currently described in Rules UI, not enforced in code)

### UI parity checklist

- hex tile geometry and row shifts
- hidden/unlocked state
- completion modal with proof URL
- completed tile overview modal
- admin user/team/board setup
- game generation transaction

## 12) What is not implemented yet  - `npm run seedTiles`
   - or use admin “Generate Game” button for event+board+tiles
4. Run app:
   - `npm run dev`
5. Login as seeded admin (seed script uses username/password both `admin`).

## 11) TanStack Start migration blueprint

Goal: same game behavior, cleaner boundaries.

### Suggested target architecture

- `apps/web` (TanStack Start)
- `packages/db` (Kysely schema + queries + migrations)
- `packages/domain` (pure game rules: unlock logic, scoring rules, validation)
- `packages/ui` (board + modal primitives)

### Route mapping (Next -> TanStack Start)

- `/` -> authenticated route with loader:
  - load session user
  - load team + board + tile states
- `/login` -> public route with server action for login
- `/admin/dashboard` -> protected admin route
- `/forbidden` -> static route

### Action mapping

Replace Next Server Actions with TanStack Start server functions:

- `login`, `logout`, `createUser`, `createTeam`, `assignUserToTeam`, `assignBoardToTeam`
- `createGame`
- `completeTile`
- data loaders for users/teams/boards/tiles

### Data model improvements for rewrite

To make team-scoped gameplay correct:

- Keep `tiles` as static board catalog.
- Add `team_tile_completions(team_id, tile_id, completed_by_user_id, proof_url, completed_at)` with unique `(te - Current model records per-user completion, but board uses team scope visually.

5. **Events are created but not consistently used**
   - `createGame` links board to event.
   - Team/event assignment is not wired in admin assignment flows.
   - App read path mostly uses user/team/board directly.

6. **Type/model mismatches**
   - `Event.ts` exports `type Board = Omit<EventModel, 'id'>...` (naming bug).
   - `TileCompletionModel` lacks `proof` field even though DB has it.

7. **Minor UX correctness issues**
   - login password input uses `type="text"` (not password)
   - some modal titles/names are inconsistent (`CreateTeamModal` naming in user modal/team detail file)

## 10) Reproduction guide (current architecture)

1. Provision Postgres and set env (`DATABASE_URL` for prod path or local docker host config in `src/lib/db.ts`).
2. Run migrations via dbmate:
   - `npm run migrate`
3. See
- `db/migrations/*.sql`: schema history
- `db/schema.sql`: full merged schema dump
- `db/seeds/*.ts`: seed admin user, board config, tile inserts

## 9) Current gaps and defects (important for faithful reproduction)

1. **Build is broken by Next config**
   - `next.config.ts` has invalid `turbopack.rules` value (`true`), causing `next build` failure:
   - `TypeError: rule.loaders is not iterable`

2. **Session secret is hardcoded in source**
   - `src/lib/session.ts` contains a fixed password string.
   - Should be environment-based.

3. **Completion query can duplicate board rows**
   - `getTilesWithCompletions` joins `users -> teams -> boards -> tiles` filtered by team ID.
   - It does not constrain to on `src/components/TeamStats.tsx`: team panel (minimal currently)
- `src/components/GenericModal.tsx`: reusable modal shell
- `src/components/navigation/*`: top nav + user dropdown
- `src/components/icons/SpinnerIcon.tsx`: loading icon
- `src/components/types.ts`: tile/board front-end types
- `src/components/config.ts`: `TILESIZE`

### Data/DB typing

- `src/data/tiles.ts`: 108 task definitions
- `src/models/*.ts`: Kysely model typing for tables
- `src/lib/db.ts`: Kysely + `pg` pool setup
- `src/lib/session.ts`: iron-session cookie config
- `src/lib/supabaseClien.ts`: client creation helper (currently unused in app flow)
- `src/lib/migrateSupabase.m
- `src/app/util.ts`: tile visibility algorithm
- `src/app/LogoutForm.tsx`: logout server action form

### Actions (server)

- `src/actions/auth.ts`: login/session/logout
- `src/actions/users.ts`: create/list/fetch users
- `src/actions/teams.ts`: create/list/fetch teams; assign board/users
- `src/actions/boards.ts`: list/fetch boards; create default board config
- `src/actions/tiles.ts`: insert completion; query board tiles+completion; create tiles in transaction
- `src/actions/events.ts`: create/fetch event
- `src/actions/games.ts`: orchestrates event+board+tiles creation

### Components

- `src/components/Board.tsx`: honeycomb rendering of rows/tiles
- `src/components/Tile.tsx`: tile interacti Users overview:
  - list users
  - create user modal
- Game settings:
  - “Generate Game” -> `createGame()` transaction

### Game creation transaction

`src/actions/games.ts`:

1. `createEvent(trx)` (`src/actions/events.ts`)
2. `createBoard(trx, event.id)` (`src/actions/boards.ts`)
3. `createTiles(trx, board.id)` (`src/actions/tiles.ts`, from `src/data/tiles.ts`)

Returns `{ success: true }` on completion.

## 8) File-by-file code purpose map

### Routes

- `src/app/layout.tsx`: root HTML/body wrapper
- `src/app/page.tsx`: main authenticated board page
- `src/app/login/page.tsx`: login route
- `src/app/forbidden/page.tsx`: unauthorized page
- `src/app/admin/dashbo
### Main page

`src/app/page.tsx` server route:

1. reads session
2. redirects to `/login` if no session user
3. fetches DB user (`getUserById`)
4. fetches team via `session.user.team_id`
5. fetches board via `team.board_id`
6. fetches tiles + completion joins via `getTilesWithCompletions(board.id, team.id)`
7. renders:
   - `Navigation`
   - `Board`
   - `TeamStats`
   - or “not assigned to team” message

### Board unlocking/completion

- `Board.tsx` builds board rows from `board.config` tile IDs + fetched tile records.
- `updateTileVisibility` in `src/app/util.ts`:
  - always visible IDs: `46,57,58`
  - completed tiles always visible
  - non-completed tile visible if adjacent to any completed tile
  - otherwise hidden
- `Tile.tsx`:
  - hidden tile: non-interactive
  - non-completed visible tile: open completion modal
  - completed visible tile: open overview modal
- `TileModal.tsx`:
  - optimistic client update marks tile complete locally + recalculates visibility
  - posts completion to server (`postTileCompletion`) with proof URL
- `TileOverviewModal.tsx` shows who completed and when

## 7) Runtime flow: admin side

### Access control

`src/app/admin/dashboard/page.tsx`:

- checks session and role `ADMIN`
- redirects non-admin to `/forbidden`

### Admin sections

-iles total
- Colors:
  - `bg-yellow-500`: 33
  - `bg-purple-500`: 27
  - `bg-red-500`: 21
  - `bg-blue-300`: 15
  - `bg-green-400`: 9
  - `bg-white`: 3
- Point values:
  - `32`: 33 tiles
  - `16`: 27 tiles
  - `8`: 21 tiles
  - `4`: 15 tiles
  - `2`: 9 tiles
  - `1`: 3 tiles

Adjacency drives unlock behavior. Many outer/high-point tiles have `adjacentTiles: []`, meaning they are unlock targets rather than unlockers.

## 6) Runtime flow: player side

### Auth

- Login page: `src/app/login/page.tsx`
- Login form (client): `src/app/login/components/LoginForm.tsx`
- Server auth action: `src/actions/auth.ts`
  - fetches user by username
  - bcrypt compares password
  -# OSRS Honeycomb Bingo - Full Project Research and Rebuild Map

## 1) What this project is

This is a Next.js App Router app for a team-based OSRS bingo event using a **hex/honeycomb board** (108 tiles), not a square bingo card.

Core gameplay loop:

1. Admin creates a game (event + board + tiles).
2. Admin creates users/teams and assigns users + board to teams.
3. Players log in and see team board tiles.
4. Players complete unlocked tiles by submitting proof URL.
5. Completion unlocks adjacent tiles outward from the center/start set.

## 2) Stack and architecture

- Framework: Next.js (App Router, React 19)  
- Styling: Tailwind CSS v4  
- DB access: Kysely + `pg` (Postgres)  
- Auth/session: `iron-session` cookie session + bcrypt password checks  
- UI libs: Headless UI, React Icons  
- Validation: Zod

Primary directories:

- `src/app`: routes/pages/layout
- `src/components`: board UI, modals, navigation
- `src/actions`: server actions (auth, game setup, CRUD)
- `src/lib`: DB/session/supabase helpers
- `src/models`: Kysely table typings
- `src/data/tiles.ts`: canonical 108-tile content
- `db/migrations`: SQL schema evolution
- `db/seeds`: seed scripts

## 3) Domain model (intended)

From code + schema comments:

- `events` is intended as root context (one bingo run).
- `boards` belongs to an event.
- `teams` belongs to an event and can be assigned a board.
- `users` belong to a team.
- `tiles` belong to a board.
- `tile_completions` links user -> tile with proof + timestamp.

Tables (from `db/schema.sql`):

- `users(id, username UNIQUE, password, role, team_id FK teams)`
- `teams(id, name, board_id FK boards, event_id FK events)`
- `boards(id, name UNIQUE, config JSONB[], event_id FK events)`
- `tiles(id, label, url, color, adjacent_tiles int[], points, board_id FK boards)`
- `tile_completions(id, user_id FK users, tile_id FK tiles, proof, completed_at)`
- `events(id, name, start_time, duration_minutes)`

## 4) Honeycomb board geometry

Board config is hardcoded in two places:

- `src/actions/boards.ts`
- `db/seeds/insertBoard.ts`

Row layout:

- 12 rows, tile counts by row: `6,7,8,9,10,11,12,11,10,9,8,7` (108 total)
- Shift values: `6,5,4,3,2,1,0,1,2,3,4,5`
- Visual positioning in UI:
  - `TILESIZE = 70`
  - each row absolutely positioned with `top = rowIndex * (TILESIZE*0.75 + 8)`
  - row horizontal shift from `shift`
- Tiles are clipped to a hex polygon shape (`clip-path`).

## 5) Tile dataset (game content)

`src/data/tiles.ts` defines all tiles with:

- `id`, `label`, `url`, `color`, `adjacentTiles`, `points`

Distribution:

- 108 t
