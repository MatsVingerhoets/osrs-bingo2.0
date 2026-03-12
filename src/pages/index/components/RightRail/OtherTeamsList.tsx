import { railPanelClassName } from '../styles'
import type { OtherTeamStandingEntry } from '../types'

export function OtherTeamsList({
  otherTeams,
}: {
  otherTeams: readonly OtherTeamStandingEntry[]
}) {
  return (
    <section className={railPanelClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Other Teams
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">
            Event standings
          </h2>
        </div>
        <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">
          Live
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {otherTeams.length === 0 ? (
          <p className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-400">
            No rival teams are assigned to this event yet.
          </p>
        ) : (
          otherTeams.map((team) => (
            <div
              key={team.teamId}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  #{team.rank} {team.teamName}
                </p>
              </div>
              <p className="text-sm font-semibold text-cyan-300">
                {team.score} pts
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
