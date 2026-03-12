import { surfaceClassName } from '../styles'
import type { RecentCompletionEntry } from '../types'

export function RecentCompletionsList({
  teamName,
  recentCompletions,
  onSelectCompletion,
}: {
  teamName: string
  recentCompletions: readonly RecentCompletionEntry[]
  onSelectCompletion?: (tileKey: string) => void
}) {
  return (
    <section
      className={`${surfaceClassName} flex min-h-0 flex-1 flex-col p-4 sm:p-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Recent Completions
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">
            Latest verified {teamName} tiles
          </h2>
        </div>
        <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">
          Live
        </span>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        {recentCompletions.length === 0 ? (
          <p className="rounded-[1rem] border border-slate-400/15 bg-slate-900/70 px-3.5 py-3 text-sm text-slate-400">
            No team completions recorded for this event yet.
          </p>
        ) : (
          recentCompletions.map((completion) => {
            const content = (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">
                    {completion.tileKey} · {completion.tileLabel}
                  </p>
                  <p className="text-sm font-semibold text-cyan-300">
                    {completion.tilePoints} pts
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {completion.completedByName} · {completion.completedAtLabel}
                </p>
              </>
            )

            if (!onSelectCompletion) {
              return (
                <div
                  key={completion.id}
                  className="rounded-[1rem] border border-slate-400/15 bg-slate-900/70 px-3.5 py-3"
                >
                  {content}
                </div>
              )
            }

            return (
              <button
                key={completion.id}
                type="button"
                onClick={() => onSelectCompletion(completion.tileKey)}
                className="rounded-[1rem] border border-slate-400/15 bg-slate-900/70 px-3.5 py-3 text-left transition hover:border-cyan-300/30 hover:bg-slate-900"
              >
                {content}
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}
