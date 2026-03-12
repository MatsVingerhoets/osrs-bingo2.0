import type { StatusPanelProps } from './types'
import { surfaceClassName } from './styles'

export function StatusPanel({
  eyebrow,
  title,
  description,
  children,
}: StatusPanelProps) {
  return (
    <section className={`${surfaceClassName} p-6 sm:p-7`}>
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-[2rem]">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        {description}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  )
}
