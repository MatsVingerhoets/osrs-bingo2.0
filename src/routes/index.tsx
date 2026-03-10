import { createFileRoute, Link } from '@tanstack/react-router'
import {
  deriveTeamScore,
  deriveUserContributions,
  getBoardTileStateMap,
  getVisibleTileKeys,
} from '#/domain/board-state'
import { canSubmitTeamCompletion, isEventPlayable } from '#/domain/event-state'
import {
  canonicalBoardDefinition,
  canonicalBoardLayoutMetadata,
} from '#/features/board/canonical-board'
import { getCurrentAuth } from '#/server/auth/current-auth'
import { publicEnv } from '#/lib/env/public'

const phaseItems = [
  'Canonical board source is checked into the repo and validated on import.',
  'Visibility is derived from initial tiles plus adjacency from completions.',
  'Team score is derived from normalized tile records instead of counters.',
  'Per-user contribution summaries are pure domain output.',
  'Event-state helpers gate when gameplay actions are allowed.',
]

const previewCompletions = [
  { tile_key: '46', completed_by_user_id: 'alice' },
  { tile_key: '57', completed_by_user_id: 'sam' },
  { tile_key: '69', completed_by_user_id: 'sam' },
] as const

const previewTiles = canonicalBoardDefinition.tiles.map((tile) => ({
  tile_key: tile.tile_key,
  adjacent_tile_keys: tile.adjacent_tile_keys,
  points: tile.points,
}))

const previewStateMap = getBoardTileStateMap(
  previewTiles,
  [...previewCompletions],
  canonicalBoardLayoutMetadata,
)

const visibleTileCount = getVisibleTileKeys(
  previewTiles,
  [...previewCompletions],
  canonicalBoardLayoutMetadata,
).length

const previewScore = deriveTeamScore(previewTiles, [...previewCompletions])
const previewContributions = deriveUserContributions(previewTiles, [
  ...previewCompletions,
])
const playableStatus = isEventPlayable('active')
const canSubmitInPreview = canSubmitTeamCompletion('active')

const nextSlices = [
  'Current event resolution and team-scoped board loading',
  'Honeycomb board rendering and proof submission flow',
  'Admin inspection, invalidation, and hardening',
]

const stateToneByTileState = {
  hidden:
    'border-[rgba(71,56,41,0.08)] bg-[rgba(88,68,45,0.08)] text-stone-400',
  unlocked:
    'border-[rgba(151,81,15,0.18)] bg-[rgba(255,236,208,0.92)] text-[#7a4410]',
  completed:
    'border-[rgba(98,117,67,0.24)] bg-[rgba(213,228,188,0.96)] text-[#42522c]',
} as const

const hexTileClipPath =
  'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)'

export const Route = createFileRoute('/')({
  loader: async () => getCurrentAuth(),
  component: HomePage,
})

function HomePage() {
  const auth = Route.useLoaderData()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-10 overflow-hidden rounded-4xl border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] px-6 py-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:px-10 sm:py-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-[rgba(151,81,15,0.18)] bg-[rgba(255,248,238,0.72)] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#97510f]">
            OSRS Bingo 2.0
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-['Sora',var(--font-sans)] text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Phase 5 is live: board visibility and scoring now come from pure
              domain rules.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
              You are signed in as <strong>{auth?.name}</strong>. Authentication
              remains active, the canonical board now imports into normalized
              event records, and gameplay state can be derived without relying
              on UI or database-specific logic.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              App: {publicEnv.appName}
            </span>
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              User: {auth?.email}
            </span>
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              Roles: {auth?.roles.join(', ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(255,248,238,0.92)] px-5 py-2.5 text-sm font-semibold text-stone-800 no-underline"
            >
              Admin
            </Link>
            <a
              href="/auth/logout?returnTo=/"
              className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(151,81,15,0.08)] px-5 py-2.5 text-sm font-semibold text-[#97510f] no-underline"
            >
              Log Out
            </a>
          </div>
        </div>

        <aside className="rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Phase 5 Status
          </p>
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            {phaseItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Domain Preview
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            The board state can be derived from canonical tiles plus completions
            alone.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
            This preview uses three sample completions on the imported canonical
            board. The resulting visible tile count, team score, and per-user
            contribution split all come from pure functions in{' '}
            <code className="rounded-lg border border-white/15 bg-[rgba(30,20,10,0.92)] px-1.5 py-0.5 text-stone-100">
              src/domain
            </code>
            .
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Visible Tiles
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-950">
                {visibleTileCount}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Team Score
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-950">
                {previewScore}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Active Event
              </p>
              <p className="mt-2 text-3xl font-semibold text-stone-950">
                {playableStatus && canSubmitInPreview ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(247,239,226,0.9))] p-4">
            <div className="space-y-[-8px]">
              {canonicalBoardLayoutMetadata.rowCounts.map(
                (rowCount, rowIndex) => {
                  const rowTiles = canonicalBoardDefinition.tiles.filter(
                    (tile) => tile.row_index === rowIndex,
                  )

                  return (
                    <div
                      key={rowIndex}
                      className="flex gap-1"
                      style={{
                        paddingLeft: `${canonicalBoardLayoutMetadata.rowShifts[rowIndex] * 14}px`,
                      }}
                    >
                      {rowTiles.slice(0, rowCount).map((tile) => (
                        <div
                          key={tile.tile_key}
                          className={`flex h-10 w-[2.3rem] items-center justify-center border text-[0.62rem] font-semibold shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] ${stateToneByTileState[previewStateMap[tile.tile_key]]}`}
                          style={{
                            clipPath: hexTileClipPath,
                            WebkitClipPath: hexTileClipPath,
                          }}
                          title={`${tile.tile_key}: ${previewStateMap[tile.tile_key]}`}
                        >
                          {tile.tile_key}
                        </div>
                      ))}
                    </div>
                  )
                },
              )}
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Next Stages
          </p>
          <div className="mt-4 grid gap-3">
            {nextSlices.map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Phase {index + 6}
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-900">
                    {item}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    index === 0
                      ? 'border-[#627543]/20 bg-[#627543]/8 text-[#4f6035]'
                      : 'border-stone-300 text-stone-600'
                  }`}
                >
                  {index === 0 ? 'Next' : 'Planned'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Contribution Split
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {previewContributions.map((contribution) => (
                <div
                  key={contribution.userId}
                  className="rounded-2xl border border-[rgba(87,57,24,0.1)] bg-white/60 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-stone-900">
                    {contribution.userId}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {contribution.completedTileCount} tiles ·{' '}
                    {contribution.score} pts
                  </p>
                  <p className="mt-2 text-xs tracking-[0.12em] text-stone-500 uppercase">
                    {contribution.tileKeys.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
