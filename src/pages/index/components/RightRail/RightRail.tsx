import type { RightRailProps } from '../types'
import { PositionCard } from './PositionCard'
import { StandingsCard } from './StandingsCard'
import { TeamSnapshotCard } from './TeamSnapshotCard'

export function RightRail({
  summary,
  otherTeams,
  contributions,
}: RightRailProps) {
  const standings = [
    {
      teamId: summary.teamName,
      teamName: summary.teamName,
      rank: summary.rank,
      score: summary.score,
    },
    ...otherTeams,
  ].sort((left, right) => {
    if (left.rank !== right.rank) {
      return left.rank - right.rank
    }

    return right.score - left.score
  })

  return (
    <aside className="flex min-h-0 flex-col gap-4 self-stretch">
      <section className="grid gap-4 xl:grid-cols-2">
        <TeamSnapshotCard summary={summary} />
        <PositionCard summary={summary} otherTeams={otherTeams} />
      </section>
      <StandingsCard
        teamName={summary.teamName}
        contributions={contributions}
        standings={standings}
      />
    </aside>
  )
}
