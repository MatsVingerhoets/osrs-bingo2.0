import { railPanelClassName } from '../styles'
import type { OtherTeamStandingEntry, TeamSummary } from '../types'

export function PositionCard({
  summary,
  otherTeams,
}: {
  summary: TeamSummary
  otherTeams: readonly OtherTeamStandingEntry[]
}) {
  const teamAbove = otherTeams.find((team) => team.rank === summary.rank - 1)
  const positionDetail =
    summary.gapToAbove === null
      ? 'You are currently leading the event.'
      : teamAbove
        ? `${summary.gapToAbove} pts behind ${teamAbove.teamName}`
        : `${summary.gapToAbove} pts behind the next team`

  return (
    <section className={railPanelClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Position
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">
            Rank #{summary.rank}
          </h2>
        </div>
        <div className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-300">
          {summary.totalTeams} teams
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{positionDetail}</p>
    </section>
  )
}
