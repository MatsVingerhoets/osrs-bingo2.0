import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type SummaryCardProps = {
  eyebrow: string
  label: string
  detail: string
  value: string
  valueClassName?: string
}

type StandingsEntry = {
  name: string
  points: number
}

type BoardShellProps = {
  completedCount: number
  unlockedCount: number
  children: ReactNode
}

type RightRailProps = {
  teamLeaderboard: readonly StandingsEntry[]
  otherTeams: readonly StandingsEntry[]
}

const railPanelClassName =
  'rounded-[1.45rem] border border-slate-400/15 bg-slate-900/80 p-4 shadow-[0_16px_30px_rgba(2,6,23,0.24)]'

const standingsSurfaceClassName =
  'flex min-h-0 flex-1 flex-col rounded-[1.8rem] border border-slate-400/15 bg-gradient-to-b from-slate-900/95 to-slate-950 p-4 shadow-[0_22px_56px_rgba(2,6,23,0.32)] sm:p-5'

export function TopNav() {
  return (
    <header className="mb-3 flex flex-col gap-2 rounded-[1.25rem] border border-slate-400/15 bg-slate-900/80 px-3 py-2.5 shadow-[0_16px_30px_rgba(2,6,23,0.26)] sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg border border-teal-300/25 bg-gradient-to-b from-cyan-900 to-slate-900" />
        <div>
          <p className="text-[0.92rem] font-semibold text-white">OSRS Bingo 2.0</p>
          <p className="text-[0.72rem] text-slate-400">Spring Event 2026</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[0.82rem]">
        <Link
          to="/mockups"
          className="rounded-full bg-slate-800/90 px-3 py-1.25 text-slate-200 no-underline"
        >
          Mockups
        </Link>
        <a
          href="#"
          className="rounded-full bg-slate-800/90 px-3 py-1.25 text-slate-200 no-underline"
        >
          Rules
        </a>
        <div className="rounded-full bg-slate-800/90 px-3 py-1.25 text-slate-200">
          Mira · Team Ash
        </div>
        <a
          href="/auth/logout?returnTo=/"
          className="rounded-full bg-gradient-to-b from-slate-700 to-slate-800 px-3 py-1.25 font-semibold text-white no-underline"
        >
          Logout
        </a>
      </div>
    </header>
  )
}

export function BoardShell({
  completedCount,
  unlockedCount,
  children,
}: BoardShellProps) {
  return (
    <section className="rounded-[1.8rem] border border-slate-400/15 bg-gradient-to-b from-slate-900/95 to-slate-950 p-4 shadow-[0_22px_56px_rgba(2,6,23,0.32)] sm:p-5">
      <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Team Board
          </p>
          <h1 className="mt-1 text-lg font-bold tracking-[-0.03em] text-white sm:text-[1.45rem]">
            Team Ash live board state
          </h1>
        </div>
        <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-3 py-1.5 text-[0.82rem] text-slate-300">
          {completedCount} completed · {unlockedCount} unlocked · 184 team points
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
  valueClassName,
}: SummaryCardProps) {
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
        <p className={valueClassName ?? 'text-[1.7rem] font-bold text-white'}>
          {value}
        </p>
      </div>
    </div>
  )
}

function StandingsTabs() {
  return (
    <div className="mt-4 inline-flex w-fit rounded-full border border-slate-400/15 bg-slate-900/80 p-1">
      <span className="rounded-full bg-gradient-to-b from-slate-700 to-slate-800 px-3 py-1.25 text-[0.82rem] font-semibold text-white">
        My Team
      </span>
      <span className="px-3 py-1.25 text-[0.82rem] text-slate-400">
        Other Teams
      </span>
    </div>
  )
}

function StandingsList({
  title,
  entries,
  rankStyle = 'badge',
  pointsClassName = 'text-[0.82rem] font-semibold text-cyan-300',
  fillHeight = false,
}: {
  title: string
  entries: readonly StandingsEntry[]
  rankStyle?: 'badge' | 'prefix'
  pointsClassName?: string
  fillHeight?: boolean
}) {
  return (
    <div
      className={`${fillHeight ? 'flex-1' : ''} rounded-[1.35rem] border border-slate-400/15 bg-slate-900/70 p-3.5`}
    >
      <p className="text-[0.82rem] font-semibold text-slate-100">{title}</p>
      <div className="mt-3 space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center justify-between rounded-[1rem] bg-slate-800/75 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              {rankStyle === 'badge' ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700/95 text-[0.68rem] font-bold text-slate-200">
                  {index + 1}
                </span>
              ) : null}
              <span className="text-[0.84rem] text-slate-100">
                {rankStyle === 'prefix' ? `${index + 1}. ` : ''}
                {entry.name}
              </span>
            </div>
            <span className={pointsClassName}>{entry.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StandingsCard({
  teamLeaderboard,
  otherTeams,
}: {
  teamLeaderboard: readonly StandingsEntry[]
  otherTeams: readonly StandingsEntry[]
}) {
  return (
    <aside className={standingsSurfaceClassName}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Standings
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">Rank #2</h2>
        </div>
        <div className="text-right">
          <p className="text-[1.7rem] font-bold text-white">184</p>
          <p className="text-[0.82rem] text-slate-400">team points</p>
        </div>
      </div>

      <StandingsTabs />

      <section className="mt-4 flex min-h-0 flex-1 flex-col">
        <StandingsList title="Team Ash roster" entries={teamLeaderboard} />
        <div className="mt-3">
          <StandingsList
            title="Other teams"
            entries={otherTeams}
            rankStyle="prefix"
            pointsClassName="text-[0.82rem] font-semibold text-slate-300"
            fillHeight
          />
        </div>
      </section>
    </aside>
  )
}

export function RightRail({
  teamLeaderboard,
  otherTeams,
}: RightRailProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 self-stretch">
      <section className="grid gap-3">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <SummaryCard
            eyebrow="Team"
            label="Ash"
            detail="3 completed · 3 open"
            value="184"
          />
          <SummaryCard
            eyebrow="Position"
            label="Rank #2"
            detail="17 pts behind Ember"
            value="+6"
            valueClassName="text-[1.7rem] font-bold text-cyan-300"
          />
        </div>
      </section>

      <StandingsCard
        teamLeaderboard={teamLeaderboard}
        otherTeams={otherTeams}
      />
    </div>
  )
}
