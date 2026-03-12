import { useState, useTransition } from 'react'
import { useRouter } from '@tanstack/react-router'
import { PlayerBoard } from '#/features/board/player-board'
import { TilePanel } from '#/features/board/tile-panel'
import { submitTeamCompletion } from '#/features/completions/submit-team-completion'
import type { CurrentEventContext } from '#/features/events/current-event-context'
import type { getCurrentAuth } from '#/server/auth/current-auth'
import { BoardShell, RightRail, StatusPanel, TopNav } from './components'

const completionTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type IndexPageProps = {
  auth: Awaited<ReturnType<typeof getCurrentAuth>>
  currentEvent: CurrentEventContext
}

function formatCompletionTime(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return completionTimeFormatter.format(parsed)
}

export function IndexPage({ auth, currentEvent }: IndexPageProps) {
  const router = useRouter()
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

  const navActions = [
    {
      kind: 'link' as const,
      label: 'Rules',
      to: '/rules',
    },
    ...(auth.roles.includes('ADMIN')
      ? [
        {
          kind: 'link' as const,
          label: 'Admin',
          to: '/admin',
        },
      ]
      : []),
    {
      kind: 'href' as const,
      label: 'Logout',
      href: '/auth/logout?returnTo=/',
    },
  ]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_20%),radial-gradient(circle_at_right,rgba(59,130,246,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-2.5 text-white sm:px-5 sm:py-3 lg:px-6 lg:py-4">
      <div className="mx-auto">
        <TopNav
          appName="OSRS Bingo 2.0"
          eventName={
            currentEvent.kind === 'no-active-event'
              ? null
              : currentEvent.event.name
          }
          playerName={auth.name}
          teamName={
            currentEvent.kind === 'ready' ? currentEvent.team.name : null
          }
          actions={navActions}
        />

        {currentEvent.kind === 'no-active-event' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_22rem]">
            <StatusPanel
              eyebrow="No Active Event"
              title="The board is waiting for the next event."
              description="No event currently has status active. Players stay in this holding state until an admin starts the next event."
            />
            <StatusPanel
              eyebrow="Player Status"
              title="Signed in and ready"
              description={`${auth.name} is authenticated. Once an event is activated and a team board is assigned, this page will resolve the live player board automatically.`}
            />
          </section>
        ) : null}

        {currentEvent.kind === 'no-team' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
            <StatusPanel
              eyebrow="Active Event"
              title={currentEvent.event.name}
              description="The event is live, but your user is not assigned to a team for it yet. This is an intentional empty state, not a broken board load."
            />
            <StatusPanel
              eyebrow="Assignment Needed"
              title="Waiting for team placement"
              description="Ask an admin to assign you to a team in the current event. Once assigned, the board, completions, and team context will load here automatically."
            >
              <div className="rounded-[1rem] border border-slate-400/15 bg-slate-950/70 px-4 py-4 text-sm text-slate-300">
                Board key: {currentEvent.event.boardKey ?? 'Unassigned'}
              </div>
            </StatusPanel>
          </section>
        ) : null}

        {currentEvent.kind === 'ready' ? (
          <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <BoardShell
              eyebrow="Team Board"
              title={`${currentEvent.team.name} live board`}
              description={`${currentEvent.event.name} is active. Select an unlocked tile to submit proof, or open a completed tile to inspect proof and attribution details.`}
              metrics={[
                {
                  label: 'Visible',
                  value: currentEvent.board.visibleTileCount,
                },
                {
                  label: 'Completed',
                  value: currentEvent.board.completedTileCount,
                },
                {
                  label: 'Score',
                  value: currentEvent.board.score,
                },
              ]}
            >
              <PlayerBoard
                layout={currentEvent.board.layout}
                tiles={currentEvent.board.tiles}
                onSelectTile={(tile) => {
                  setSubmissionError(null)
                  setSelectedTileKey(tile.tileKey)
                }}
              />
            </BoardShell>

            <RightRail
              summary={{
                teamName: currentEvent.team.name,
                score: currentEvent.board.score,
                rank: currentEvent.standings.currentTeamRank,
                totalTeams: currentEvent.standings.totalTeams,
                gapToAbove: currentEvent.standings.gapToAbove,
                gapToBelow: currentEvent.standings.gapToBelow,
                completedTileCount: currentEvent.board.completedTileCount,
                visibleTileCount: currentEvent.board.visibleTileCount,
                unlockedTileCount:
                  currentEvent.board.visibleTileCount -
                  currentEvent.board.completedTileCount,
                totalTileCount: currentEvent.board.totalTileCount,
                boardStatusLabel: currentEvent.board.canSubmit
                  ? 'Submissions open'
                  : 'Read only',
                boardStatusValue: currentEvent.board.canSubmit
                  ? 'Live'
                  : 'Locked',
                boardDetail: `${currentEvent.board.name} ${currentEvent.board.version} · ${currentEvent.board.totalTileCount} total tiles`,
              }}
              otherTeams={currentEvent.standings.otherTeams.map((standing) => ({
                teamId: standing.teamId,
                teamName: standing.teamName,
                rank: standing.rank,
                score: standing.score,
              }))}
              contributions={currentEvent.contributions.map((contribution) => ({
                key: contribution.userId,
                name: contribution.userName,
                score: contribution.score,
                completedTileCount: contribution.completedTileCount,
                tileKeys: contribution.tileKeys,
              }))}
              recentCompletions={currentEvent.completions
                .slice(0, 6)
                .map((completion) => ({
                  id: completion.id,
                  tileKey: completion.tileKey,
                  tileLabel: completion.tileLabel,
                  tilePoints: completion.tilePoints,
                  completedByName: completion.completedByName,
                  completedAtLabel: formatCompletionTime(
                    completion.completedAt,
                  ),
                }))}
              onSelectCompletion={(tileKey) => {
                setSubmissionError(null)
                setSelectedTileKey(tileKey)
              }}
            />
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
      </div>
    </main>
  )
}
