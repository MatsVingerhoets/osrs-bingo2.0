import type { BoardShellProps } from './types'
import { surfaceClassName } from './styles'

export function BoardShell({
  eyebrow,
  title,
  description,
  metrics,
  children,
}: BoardShellProps) {
  return (
    <section className={`${surfaceClassName} p-3.5 sm:p-4`}>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-lg font-bold tracking-[-0.03em] text-white sm:text-[1.45rem]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:min-w-[21rem]">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-3.5 py-2.5"
            >
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1.5 text-[1.65rem] font-semibold text-white">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {children}
    </section>
  )
}
