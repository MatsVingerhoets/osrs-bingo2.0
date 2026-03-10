import { useState, useTransition } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { PlayerBoard } from '#/features/board/player-board'
import { TilePanel } from '#/features/board/tile-panel'
import { submitTeamCompletion } from '#/features/completions/submit-team-completion'
import { getCurrentEventContext } from '#/features/events/current-event-context'
import { getCurrentAuth } from '#/server/auth/current-auth'

const phaseItems = [
  'The player board renders the honeycomb layout from runtime board rows.',
  'Hidden, unlocked, and completed tiles have distinct interaction states.',
  'Unlocked tiles open a proof submission panel.',
  'Successful submissions refresh the current event board state.',
  'Completed tiles show proof and attribution details.',
]

const roadmapPhases = [
  { phase: 4, label: 'Canonical board import', status: 'done' },
  { phase: 5, label: 'Pure domain rules', status: 'done' },
  { phase: 6, label: 'Current event resolution', status: 'done' },
  { phase: 7, label: 'Player board experience', status: 'current' },
  { phase: 8, label: 'Admin event setup flow', status: 'next' },
  { phase: 9, label: 'Team management and assignment', status: 'next' },
] as const

export const Route = createFileRoute('/')({
  loader: async () => ({
    auth: await getCurrentAuth(),
    currentEvent: await getCurrentEventContext(),
  }),
  component: HomePage,
})

function HomePage() {
  const router = useRouter()
  const { auth, currentEvent } = Route.useLoaderData()
  const [selectedTileKey, setSelectedTileKey] = useState<string | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!auth) {
    return null
  }

  const selectedTile =
    currentEvent.kind === 'ready'
      ? (currentEvent.board.tiles.find(
          (tile) => tile.tileKey === selectedTileKey,
        ) ?? null)
      : null

  const selectedCompletion =
    currentEvent.kind === 'ready' && selectedTile
      ? currentEvent.completions.find(
          (completion) => completion.tileKey === selectedTile.tileKey,
        )
      : undefined

  async function handleSubmitCompletion(proofUrl: string) {
    if (!selectedTile) {
      return
    }

    setSubmissionError(null)

    try {
      await submitTeamCompletion({
        data: {
          tileKey: selectedTile.tileKey,
          proofUrl,
        },
      })

      startTransition(() => {
        void router.invalidate()
      })

      setSelectedTileKey(null)
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : 'Could not submit completion',
      )
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-10 overflow-hidden rounded-4xl border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.92),rgba(255,250,240,0.74))] px-6 py-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:px-10 sm:py-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-[rgba(151,81,15,0.18)] bg-[rgba(255,248,238,0.72)] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#97510f]">
            OSRS Bingo 2.0
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-['Sora',var(--font-sans)] text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Phase 7 is live: players can view and interact with the current
              honeycomb board.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
              You are signed in as <strong>{auth.name}</strong>. The player
              board now shows hidden, unlocked, and completed tiles and supports
              proof URL submission for unlocked goals.
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
                  : currentEvent.board.canSubmit
                    ? 'Playing'
                    : 'Read only'}
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
            Phase 7 Status
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

      <section className="mt-8 rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.88),rgba(255,250,240,0.7))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.08)] backdrop-blur-[10px] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              Phase Roadmap
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              Progress across the implementation plan
            </h2>
          </div>
          <p className="text-sm text-stone-600">
            Keeps the shipped phases and next steps visible from the player
            home.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roadmapPhases.map((item) => (
            <div
              key={item.phase}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                  Phase {item.phase}
                </p>
                <p className="mt-1 text-sm font-medium text-stone-900">
                  {item.label}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  item.status === 'done'
                    ? 'border-[#627543]/20 bg-[#627543]/8 text-[#4f6035]'
                    : item.status === 'current'
                      ? 'border-[#97510f]/20 bg-[#97510f]/8 text-[#97510f]'
                      : 'border-stone-300 text-stone-600'
                }`}
              >
                {item.status === 'done'
                  ? 'Done'
                  : item.status === 'current'
                    ? 'Current'
                    : 'Next'}
              </span>
            </div>
          ))}
        </div>
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
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
                  Current Board
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-stone-950">
                  {currentEvent.event.name} · {currentEvent.team.name}
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <MetricCard
                  label="Visible"
                  value={currentEvent.board.visibleTileCount}
                />
                <MetricCard
                  label="Completed"
                  value={currentEvent.board.completedTileCount}
                />
                <MetricCard label="Score" value={currentEvent.board.score} />
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-stone-700 sm:text-base">
              Select an unlocked tile to submit proof, or open a completed tile
              to inspect its proof and attribution details.
            </p>

            <div className="mt-6">
              <PlayerBoard
                layout={currentEvent.board.layout}
                tiles={currentEvent.board.tiles}
                onSelectTile={(tile) => {
                  setSubmissionError(null)
                  setSelectedTileKey(tile.tileKey)
                }}
              />
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              Team Snapshot
            </p>
            <div className="mt-4 grid gap-3">
              <InfoRow
                label="Board"
                value={`${currentEvent.board.name} (${currentEvent.board.version})`}
              />
              <InfoRow label="Board Key" value={currentEvent.board.key} />
              <InfoRow
                label="Submissions"
                value={currentEvent.board.canSubmit ? 'Open' : 'Closed'}
              />
              <InfoRow
                label="Total Tiles"
                value={String(currentEvent.board.totalTileCount)}
              />
            </div>

            <section className="mt-6 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Contribution Split
              </p>
              <div className="mt-3 grid gap-3">
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
            </section>

            <section className="mt-6 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4">
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
                    <button
                      key={completion.id}
                      type="button"
                      onClick={() => {
                        setSubmissionError(null)
                        setSelectedTileKey(completion.tileKey)
                      }}
                      className="block w-full rounded-2xl border border-[rgba(87,57,24,0.1)] bg-white/60 px-4 py-3 text-left"
                    >
                      <p className="text-sm font-semibold text-stone-900">
                        {completion.tileKey} · {completion.tileLabel}
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {completion.tilePoints} pts · by{' '}
                        {completion.completedByName}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </article>
        </section>
      ) : null}

      {selectedTile && currentEvent.kind === 'ready' ? (
        <TilePanel
          tile={selectedTile}
          completion={selectedCompletion}
          canSubmit={currentEvent.board.canSubmit}
          isSubmitting={isPending}
          errorMessage={submissionError}
          onClose={() => {
            setSubmissionError(null)
            setSelectedTileKey(null)
          }}
          onSubmit={handleSubmitCompletion}
        />
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
