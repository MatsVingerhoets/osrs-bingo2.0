import { createFileRoute, Link } from '@tanstack/react-router'
import { getCurrentEventContext } from '#/features/events/current-event-context'
import { getCurrentAuth } from '#/server/auth/current-auth'

const phaseItems = [
  'Current event lookup is resolved server-side.',
  'Membership is scoped to the active event before loading board data.',
  'Board tiles and team completions load as one canonical read model.',
  'Players without a team get an explicit non-game state.',
  'Board visibility and score still come from the pure domain layer.',
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
  loader: async () => ({
    auth: await getCurrentAuth(),
    currentEvent: await getCurrentEventContext(),
  }),
  component: HomePage,
})

function HomePage() {
  const { auth, currentEvent } = Route.useLoaderData()

  if (!auth) {
    return null
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-10 overflow-hidden rounded-4xl border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] px-6 py-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:px-10 sm:py-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-[rgba(151,81,15,0.18)] bg-[rgba(255,248,238,0.72)] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#97510f]">
            OSRS Bingo 2.0
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-['Sora',var(--font-sans)] text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Phase 6 is live: the app can now resolve the current event and
              team board context.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
              You are signed in as <strong>{auth.name}</strong>. The player home
              route now resolves the active event, your team membership, and the
              board state server-side before rendering.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              User: {auth.email}
            </span>
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              Roles: {auth.roles.join(', ')}
            </span>
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              Status:{' '}
              {currentEvent.kind === 'no-active-event'
                ? 'Waiting for event'
                : currentEvent.kind === 'no-team'
                  ? 'Needs team'
                  : 'Board loaded'}
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
            Phase 6 Status
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

      {currentEvent.kind === 'no-active-event' ? (
        <section className="mt-8 rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            No Active Event
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            The gameplay board is not live yet.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
            No event currently has status <code>active</code>. Players stay in
            this holding state until an admin starts the next event.
          </p>
        </section>
      ) : null}

      {currentEvent.kind === 'no-team' ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              Active Event
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">
              {currentEvent.event.name}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-700 sm:text-base">
              The event is live, but your user is not assigned to a team for it
              yet. This is an intentional empty state, not a broken board load.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              What To Do
            </p>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p>Ask an admin to assign you to a team in the current event.</p>
              <p>
                Once assigned, this page will resolve your team board and
                completions automatically.
              </p>
              <p>
                Board key:{' '}
                <strong>{currentEvent.event.boardKey ?? 'Unassigned'}</strong>
              </p>
            </div>
          </article>
        </section>
      ) : null}

      {currentEvent.kind === 'ready' ? (
        <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              Current Board
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">
              {currentEvent.event.name} · {currentEvent.team.name}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
              The active event and your team membership both resolved
              successfully. This preview is now driven by real board tiles and
              real team completion rows.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <MetricCard
                label="Visible Tiles"
                value={currentEvent.board.visibleTileCount}
              />
              <MetricCard
                label="Completed"
                value={currentEvent.board.completedTileCount}
              />
              <MetricCard label="Team Score" value={currentEvent.board.score} />
              <MetricCard
                label="Submissions"
                value={currentEvent.board.canSubmit ? 'Open' : 'Closed'}
              />
            </div>
            <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,250,244,0.96),rgba(247,239,226,0.9))] p-4">
              <div className="space-y-[-8px]">
                {currentEvent.board.layout.rowCounts.map(
                  (rowCount, rowIndex) => {
                    const rowTiles = currentEvent.board.tiles.filter(
                      (tile) => tile.rowIndex === rowIndex,
                    )

                    return (
                      <div
                        key={rowIndex}
                        className="flex gap-1"
                        style={{
                          paddingLeft: `${currentEvent.board.layout.rowShifts[rowIndex] * 14}px`,
                        }}
                      >
                        {rowTiles.slice(0, rowCount).map((tile) => (
                          <div
                            key={tile.id}
                            className={`flex h-10 w-[2.3rem] items-center justify-center border text-[0.62rem] font-semibold shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] ${stateToneByTileState[tile.state]}`}
                            style={{
                              clipPath: hexTileClipPath,
                              WebkitClipPath: hexTileClipPath,
                            }}
                            title={`${tile.tileKey}: ${tile.label}`}
                          >
                            {tile.tileKey}
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
              Loaded Context
            </p>
            <div className="mt-4 grid gap-3">
              <InfoRow
                label="Board"
                value={`${currentEvent.board.name} (${currentEvent.board.version})`}
              />
              <InfoRow label="Board Key" value={currentEvent.board.key} />
              <InfoRow
                label="Can View"
                value={currentEvent.board.canView ? 'Yes' : 'No'}
              />
              <InfoRow
                label="Total Tiles"
                value={String(currentEvent.board.totalTileCount)}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Contribution Split
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {currentEvent.contributions.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    No tiles have been completed yet.
                  </p>
                ) : (
                  currentEvent.contributions.map((contribution) => (
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
                      <p className="mt-2 text-xs uppercase tracking-[0.12em] text-stone-500">
                        {contribution.tileKeys.join(', ')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Recent Completions
              </p>
              <div className="mt-3 space-y-3">
                {currentEvent.completions.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    No team completions recorded for this event yet.
                  </p>
                ) : (
                  currentEvent.completions.slice(0, 6).map((completion) => (
                    <div
                      key={completion.id}
                      className="rounded-2xl border border-[rgba(87,57,24,0.1)] bg-white/60 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-stone-900">
                        {completion.tileKey} · {completion.tileLabel}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {completion.tilePoints} pts · by{' '}
                        {completion.completedByName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </main>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
        {label}
      </p>
      <p className="text-sm font-medium text-stone-900">{value}</p>
    </div>
  )
}
