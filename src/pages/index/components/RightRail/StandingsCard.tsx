import { railPanelClassName } from '../styles'
import type {
  ContributionEntry,
  OtherTeamStandingEntry,
} from '../types'

type StandingsCardProps = {
  teamName: string
  contributions: readonly ContributionEntry[]
  standings: readonly OtherTeamStandingEntry[]
}

export function StandingsCard({
  teamName,
  contributions,
  standings,
}: StandingsCardProps) {
  return (
    <section className={railPanelClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Standings
          </p>
        </div>
        <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">
          Live
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          {teamName} members
        </p>
        <div className="mt-3 grid gap-3">
          {contributions.length === 0 ? (
            <p className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-400">
              No completed tiles yet.
            </p>
          ) : (
            contributions.map((contribution) => (
              <div
                key={contribution.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {contribution.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {contribution.completedTileCount} tiles
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-cyan-300">
                  {contribution.score} pts
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-400">
          All teams
        </p>
        <div className="mt-3 grid gap-3">
          {standings.map((team) => (
            <div
              key={team.teamId}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3"
            >
              <p className="text-sm font-semibold text-white">
                #{team.rank} {team.teamName}
              </p>
              <p className="shrink-0 text-sm font-semibold text-cyan-300">
                {team.score} pts
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
