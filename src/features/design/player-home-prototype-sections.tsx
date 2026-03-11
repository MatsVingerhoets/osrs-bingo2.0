import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type NavAction =
  | {
      kind: 'link'
      label: string
      to: string
    }
  | {
      kind: 'href'
      label: string
      href: string
    }
  | {
      kind: 'text'
      label: string
      value: string
    }

type TopNavProps = {
  appName: string
  eventName?: string | null
  playerName: string
  teamName?: string | null
  actions?: readonly NavAction[]
}

type BoardMetric = {
  label: string
  value: string | number
}

type BoardShellProps = {
  eyebrow: string
  title: string
  description: string
  metrics: readonly BoardMetric[]
  children: ReactNode
}

type RailStat = {
  eyebrow: string
  label: string
  detail: string
  value: string
  valueTone?: 'default' | 'accent'
}

type ContributionEntry = {
  key: string
  name: string
  score: number
  completedTileCount: number
  tileKeys: readonly string[]
}

type RecentCompletionEntry = {
  id: string
  tileKey: string
  tileLabel: string
  tilePoints: number
  completedByName: string
  completedAtLabel: string
}

type RightRailProps = {
  stats: readonly RailStat[]
  contributionTitle: string
  contributions: readonly ContributionEntry[]
  recentCompletions: readonly RecentCompletionEntry[]
  onSelectCompletion?: (tileKey: string) => void
}

type StatusPanelProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

const railPanelClassName =
  'rounded-[1.45rem] border border-slate-400/15 bg-slate-900/80 p-4 shadow-[0_16px_30px_rgba(2,6,23,0.24)]'

const surfaceClassName =
  'rounded-[1.8rem] border border-slate-400/15 bg-gradient-to-b from-slate-900/95 to-slate-950 shadow-[0_22px_56px_rgba(2,6,23,0.32)]'

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

export function BoardShell({
  eyebrow,
  title,
  description,
  metrics,
  children,
}: BoardShellProps) {
  return (
    <section className={`${surfaceClassName} p-4 sm:p-5`}>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-lg font-bold tracking-[-0.03em] text-white sm:text-[1.45rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:min-w-[22rem]">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-4 py-3"
            >
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
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

function SummaryCard({
  eyebrow,
  label,
  detail,
  value,
  valueTone = 'default',
}: RailStat) {
  return (
    <div className={railPanelClassName}>
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
        {eyebrow}
      </p>
      <div className="mt-2.5 flex items-end justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{label}</p>
          <p className="mt-1 text-[0.82rem] text-slate-400">{detail}</p>
        </div>
        <p
          className={
            valueTone === 'accent'
              ? 'text-[1.7rem] font-bold text-cyan-300'
              : 'text-[1.7rem] font-bold text-white'
          }
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function ContributionList({
  title,
  contributions,
}: {
  title: string
  contributions: readonly ContributionEntry[]
}) {
  return (
    <section className={railPanelClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Team Activity
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">{title}</h2>
        </div>
        <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">
          Phase 2
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {contributions.length === 0 ? (
          <p className="rounded-[1rem] border border-slate-400/15 bg-slate-950/70 px-3.5 py-3 text-sm text-slate-400">
            No completed tiles yet.
          </p>
        ) : (
          contributions.map((contribution) => (
            <div
              key={contribution.key}
              className="rounded-[1rem] border border-slate-400/15 bg-slate-950/70 px-3.5 py-3"
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

function RecentCompletionsList({
  recentCompletions,
  onSelectCompletion,
}: {
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
            Latest verified team tiles
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

export function RightRail({
  stats,
  contributionTitle,
  contributions,
  recentCompletions,
  onSelectCompletion,
}: RightRailProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 self-stretch">
      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {stats.map((stat) => (
          <SummaryCard key={stat.eyebrow} {...stat} />
        ))}
      </section>

      <ContributionList
        title={contributionTitle}
        contributions={contributions}
      />
      <RecentCompletionsList
        recentCompletions={recentCompletions}
        onSelectCompletion={onSelectCompletion}
      />
    </div>
  )
}

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
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
        {description}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  )
}
