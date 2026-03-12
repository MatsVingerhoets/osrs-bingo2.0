import { useState } from 'react'
import { railPanelClassName, surfaceClassName } from './styles'
import type {
  ContributionEntry,
  OtherTeamStandingEntry,
  RecentCompletionEntry,
  RightRailProps,
  TeamSummary,
} from './types'

type RailTab = 'my-team' | 'other-teams'

function TeamSummaryCard({ summary }: { summary: TeamSummary }) {
  const rankDetail =
    summary.gapToAbove === null
      ? 'Leading the event standings'
      : `${summary.gapToAbove} pts behind the next team`

  return (
    <section className={`${surfaceClassName} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            My Team
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-white">
            {summary.teamName}
          </h2>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-cyan-200">
          {summary.boardStatusValue}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        <div className={railPanelClassName}>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
            Team Score
          </p>
          <p className="mt-2 text-[2rem] font-bold text-white">
            {summary.score}
          </p>
          <p className="mt-1 text-[0.82rem] text-slate-400">
            {summary.completedTileCount} of {summary.totalTileCount} tiles
            completed
          </p>
        </div>

        <div className={railPanelClassName}>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
            Current Rank
          </p>
          <p className="mt-2 text-[2rem] font-bold text-white">
            #{summary.rank}
          </p>
          <p className="mt-1 text-[0.82rem] text-slate-400">
            {rankDetail} · {summary.totalTeams} teams
          </p>
        </div>

        <div className={railPanelClassName}>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
            Board Status
          </p>
          <p className="mt-2 text-xl font-semibold text-cyan-300">
            {summary.boardStatusLabel}
          </p>
          <p className="mt-1 text-[0.82rem] text-slate-400">
            {summary.boardDetail}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-3.5 py-3">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
            Visible
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {summary.visibleTileCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-3.5 py-3">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
            Unlocked
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {summary.unlockedTileCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-3.5 py-3">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
            Completed
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {summary.completedTileCount}
          </p>
        </div>
      </div>
    </section>
  )
}

function OtherTeamsList({
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

function ContributionList({
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

function RecentCompletionsList({
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

function RailTabButton({
  tab,
  label,
  isActive,
  onSelect,
}: {
  tab: RailTab
  label: string
  isActive: boolean
  onSelect: (tab: RailTab) => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`rail-panel-${tab}`}
      id={`rail-tab-${tab}`}
      onClick={() => onSelect(tab)}
      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        isActive
          ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.28)]'
          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export function RightRail({
  summary,
  otherTeams,
  contributions,
  recentCompletions,
  onSelectCompletion,
}: RightRailProps) {
  const [activeTab, setActiveTab] = useState<RailTab>('my-team')

  return (
    <aside className="flex min-h-0 flex-col gap-4 self-stretch">
      <section className={`${surfaceClassName} p-4 sm:p-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
              Competitive Context
            </p>
            <h2 className="mt-1.5 text-lg font-semibold text-white">
              Event dashboard
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Standings views"
            className="flex flex-wrap gap-2"
          >
            <RailTabButton
              tab="my-team"
              label="My Team"
              isActive={activeTab === 'my-team'}
              onSelect={setActiveTab}
            />
            <RailTabButton
              tab="other-teams"
              label="Other Teams"
              isActive={activeTab === 'other-teams'}
              onSelect={setActiveTab}
            />
          </div>
        </div>

        {activeTab === 'my-team' ? (
          <div
            role="tabpanel"
            id="rail-panel-my-team"
            aria-labelledby="rail-tab-my-team"
            className="mt-4 flex flex-col gap-4"
          >
            <TeamSummaryCard summary={summary} />
            <ContributionList
              teamName={summary.teamName}
              contributions={contributions}
            />
            <RecentCompletionsList
              teamName={summary.teamName}
              recentCompletions={recentCompletions}
              onSelectCompletion={onSelectCompletion}
            />
          </div>
        ) : (
          <div
            role="tabpanel"
            id="rail-panel-other-teams"
            aria-labelledby="rail-tab-other-teams"
            className="mt-4 flex flex-col gap-4"
          >
            <section className={railPanelClassName}>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                Your Position
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Rank
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    #{summary.rank}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Score
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {summary.score}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-3.5 py-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Next Gap
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {summary.gapToAbove ?? 0}
                  </p>
                </div>
              </div>
            </section>

            <OtherTeamsList otherTeams={otherTeams} />
          </div>
        )}
      </section>
    </aside>
  )
}
