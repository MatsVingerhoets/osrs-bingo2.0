import { Link } from '@tanstack/react-router'
import type { NavAction, TopNavProps } from './types'

function NavActionChip({ action }: { action: NavAction }) {
  if (action.kind === 'link') {
    return (
      <Link
        to={action.to}
        className="rounded-full bg-slate-800/90 px-3 py-1.25 text-slate-200 no-underline transition hover:bg-slate-700/90"
      >
        {action.label}
      </Link>
    )
  }

  if (action.kind === 'href') {
    return (
      <a
        href={action.href}
        className="rounded-full bg-gradient-to-b from-slate-700 to-slate-800 px-3 py-1.25 font-semibold text-white no-underline transition hover:brightness-110"
      >
        {action.label}
      </a>
    )
  }

  return (
    <span className="rounded-full bg-slate-800/90 px-3 py-1.25 text-slate-300">
      {action.label}: {action.value}
    </span>
  )
}

export function TopNav({
  appName,
  eventName,
  playerName,
  teamName,
  actions = [],
}: TopNavProps) {
  return (
    <header className="mb-4 flex flex-col gap-2 rounded-[1.25rem] border border-slate-400/15 bg-slate-900/80 px-3 py-2.5 shadow-[0_16px_30px_rgba(2,6,23,0.26)] sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg border border-teal-300/25 bg-gradient-to-b from-cyan-900 to-slate-900" />
        <div>
          <p className="text-[0.92rem] font-semibold text-white">{appName}</p>
          <p className="text-[0.72rem] text-slate-400">
            {eventName ?? 'Awaiting active event'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[0.82rem]">
        {actions.map((action) => (
          <NavActionChip
            key={`${action.kind}-${action.label}`}
            action={action}
          />
        ))}
        <div className="rounded-full bg-slate-800/90 px-3 py-1.25 text-slate-200">
          {playerName}
          {teamName ? ` · ${teamName}` : ''}
        </div>
      </div>
    </header>
  )
}
