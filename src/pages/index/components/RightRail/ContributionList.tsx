import { railPanelClassName } from '../styles'
import type { ContributionEntry } from '../types'

export function ContributionList({
  teamName,
  contributions,
}: {
  teamName: string
  contributions: readonly ContributionEntry[]
}) {
  return (
    <section className={railPanelClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Roster
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">
            {teamName} contribution split
          </h2>
        </div>
        <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">
          Live
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {contributions.length === 0 ? (
          <p className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-400">
            No completed tiles yet.
          </p>
        ) : (
          contributions.map((contribution) => (
            <div
              key={contribution.key}
              className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-white">
                  {contribution.name}
                </p>
                <p className="text-sm font-semibold text-cyan-300">
                  {contribution.score} pts
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {contribution.completedTileCount} tiles
              </p>
              {contribution.tileKeys.length > 0 ? (
                <p className="mt-2 text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">
                  {contribution.tileKeys.join(', ')}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
