import { railPanelClassName } from '../styles'
import type { TeamSummary } from '../types'

export function TeamSnapshotCard({ summary }: { summary: TeamSummary }) {
  return (
    <section className={railPanelClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            My Team
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">
            {summary.teamName}
          </h2>
        </div>
      </div>

      <div className="mt-4">
        <div>
          <p className="inline-block mr-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Completed:
          </p>
          <p className='text-white inline-block text-sm'>{summary.completedTileCount}</p>
        </div>
        <div>
          <p className="inline-block mr-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Total Points:
          </p>
          <p className='text-white inline-block text-sm'>{summary.score}</p>
        </div>
      </div>
    </section>
  )
}
