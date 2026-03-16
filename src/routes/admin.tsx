import { useState, useTransition } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  assignUserToEventTeam,
  createDraftEvent,
  createEventTeam,
  getAdminEventSetupData,
  invalidateCompletion,
  transitionEventStatus,
  updateDraftEvent,
} from '#/features/admin/event-setup'
import { getCurrentAuth } from '#/server/auth/current-auth'
import {
  getLoginRedirectHref,
  isAdminRouteAuthorized,
} from '#/server/auth/route-guards'
import { TopNav } from '#/pages/index/components'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const auth = await getCurrentAuth()

    if (!auth) {
      throw redirect({
        href: getLoginRedirectHref(location.href),
      })
    }

    if (!isAdminRouteAuthorized(auth)) {
      throw redirect({ to: '/' })
    }

    return {
      auth,
    }
  },
  loader: async () => getAdminEventSetupData(),
  component: AdminPage,
})

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const offsetMs = parsed.getTimezoneOffset() * 60 * 1000
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16)
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const EMPTY_COMPLETION_FILTERS = {
  teamId: '',
  userId: '',
  tileQuery: '',
  startAt: '',
  endAt: '',
} as const

const adminSurfaceClassName =
  'rounded-[1.8rem] border border-slate-400/15 bg-gradient-to-b from-slate-900/95 to-slate-950 shadow-[0_22px_56px_rgba(2,6,23,0.32)]'

const adminPanelClassName =
  'rounded-[1.45rem] border border-slate-400/15 bg-slate-900/80 shadow-[0_16px_30px_rgba(2,6,23,0.24)]'

const adminInsetPanelClassName =
  'rounded-2xl border border-slate-400/15 bg-slate-950/70'

const adminLabelClassName =
  'text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300'

const adminMutedLabelClassName =
  'text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-400'

const adminInputClassName =
  'w-full rounded-2xl border border-slate-400/15 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15'

const adminSelectClassName =
  'rounded-2xl border border-slate-400/15 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15'

const primaryButtonClassName =
  'cursor-pointer rounded-full border border-cyan-300/20 bg-gradient-to-b from-cyan-400 to-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(14,165,233,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60'

const secondaryButtonClassName =
  'cursor-pointer rounded-full border border-slate-400/15 bg-slate-900/80 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/90 disabled:cursor-not-allowed disabled:opacity-60'

const dangerButtonClassName =
  'cursor-pointer rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60'

function getStatusBadgeClassName(status: string) {
  if (status === 'active') {
    return 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200'
  }

  if (status === 'draft') {
    return 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
  }

  if (status === 'completed') {
    return 'border-amber-300/20 bg-amber-400/10 text-amber-200'
  }

  return 'border-slate-400/15 bg-slate-900/80 text-slate-300'
}

function AdminPage() {
  const router = useRouter()
  const { auth } = Route.useRouteContext()
  const { events } = Route.useLoaderData()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completionFilters, setCompletionFilters] = useState<
    Record<
      string,
      {
        teamId: string
        userId: string
        tileQuery: string
        startAt: string
        endAt: string
      }
    >
  >({})
  const [isPending, startTransition] = useTransition()
  const draftEventCount = events.filter(
    (event) => event.status === 'draft',
  ).length
  const activeEventCount = events.filter(
    (event) => event.status === 'active',
  ).length
  const archivedEventCount = events.filter(
    (event) => event.status === 'archived',
  ).length

  function refreshPage() {
    startTransition(() => {
      void router.invalidate()
    })
  }

  async function handleCreateDraft(formData: FormData) {
    setError(null)
    setFeedback(null)

    try {
      await createDraftEvent({
        data: {
          name: String(formData.get('name') ?? ''),
          startTime: String(formData.get('startTime') ?? ''),
          durationMinutes: Number(formData.get('durationMinutes') ?? 0),
        },
      })

      setFeedback('Draft event created.')
      refreshPage()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not create draft event',
      )
    }
  }

  async function handleUpdateDraft(formData: FormData) {
    setError(null)
    setFeedback(null)

    try {
      await updateDraftEvent({
        data: {
          eventId: String(formData.get('eventId') ?? ''),
          name: String(formData.get('name') ?? ''),
          startTime: String(formData.get('startTime') ?? ''),
          durationMinutes: Number(formData.get('durationMinutes') ?? 0),
        },
      })

      setFeedback('Draft event updated.')
      refreshPage()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not update draft event',
      )
    }
  }

  async function handleStatusTransition(
    eventId: string,
    toStatus: 'draft' | 'active' | 'completed' | 'archived',
  ) {
    setError(null)
    setFeedback(null)

    try {
      await transitionEventStatus({
        data: {
          eventId,
          toStatus,
        },
      })

      setFeedback(`Event moved to ${toStatus}.`)
      refreshPage()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not change event status',
      )
    }
  }

  async function handleCreateTeam(formData: FormData) {
    setError(null)
    setFeedback(null)

    try {
      await createEventTeam({
        data: {
          eventId: String(formData.get('eventId') ?? ''),
          name: String(formData.get('name') ?? ''),
        },
      })

      setFeedback('Team created.')
      refreshPage()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not create team',
      )
    }
  }

  async function handleAssignUser(formData: FormData) {
    setError(null)
    setFeedback(null)

    try {
      await assignUserToEventTeam({
        data: {
          eventId: String(formData.get('eventId') ?? ''),
          teamId: String(formData.get('teamId') ?? ''),
          userId: String(formData.get('userId') ?? ''),
        },
      })

      setFeedback('Team membership updated.')
      refreshPage()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not update team membership',
      )
    }
  }

  async function handleInvalidateCompletion(completionId: string) {
    setError(null)
    setFeedback(null)

    try {
      await invalidateCompletion({
        data: {
          completionId,
        },
      })

      setFeedback('Completion invalidated.')
      refreshPage()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Could not invalidate completion',
      )
    }
  }

  function getCompletionFilterState(eventId: string) {
    return completionFilters[eventId] ?? EMPTY_COMPLETION_FILTERS
  }

  function updateCompletionFilter(
    eventId: string,
    field: keyof typeof EMPTY_COMPLETION_FILTERS,
    value: string,
  ) {
    setCompletionFilters((current) => ({
      ...current,
      [eventId]: {
        ...(current[eventId] ?? EMPTY_COMPLETION_FILTERS),
        [field]: value,
      },
    }))
  }

  const navActions = [
    {
      kind: 'link' as const,
      label: 'Home',
      to: '/',
    },
    {
      kind: 'link' as const,
      label: 'Rules',
      to: '/rules',
    },
    {
      kind: 'href' as const,
      label: 'Logout',
      href: '/auth/logout?returnTo=/',
    },
  ]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_20%),radial-gradient(circle_at_right,rgba(59,130,246,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-2.5 text-white sm:px-5 sm:py-3 lg:px-6 lg:py-4">
      <div className="mx-auto max-w-7xl">
        <TopNav
          appName="OSRS Bingo 2.0"
          eventName="Admin Control Center"
          playerName={auth.name}
          actions={navActions}
        />

        <section className={`${adminSurfaceClassName} p-6 sm:p-7`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className={adminLabelClassName}>Admin Event Setup</p>
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-[2rem]">
                Phase 8 replaces seed events with explicit setup.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Signed in as <strong className="text-white">{auth.name}</strong>
                . Drafts stay editable, activation is blocked until required
                fields are present, and live events become read only.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-300">
                  Roles: {auth.roles.join(', ')}
                </span>
                <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-slate-300">
                  Canonical board: OSRS Honeycomb
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[30rem]">
              <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-4 py-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Events
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {events.length}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-4 py-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Drafts
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {draftEventCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-4 py-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Active
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {activeEventCount}
                </p>
              </div>
            </div>
          </div>

          {feedback ? (
            <p className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">
              {feedback}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
              {error}
            </p>
          ) : null}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <article className={`${adminSurfaceClassName} p-6 sm:p-7`}>
            <p className={adminLabelClassName}>Create Draft</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white">
              Start setup before the event goes live
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              New events start in{' '}
              <code className="rounded-md bg-slate-950/70 px-1.5 py-0.5 text-slate-100">
                draft
              </code>{' '}
              with the canonical honeycomb board attached automatically. The
              event name must be unique.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleCreateDraft(new FormData(event.currentTarget))
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-100">
                  Event name
                </span>
                <input
                  name="name"
                  type="text"
                  required
                  className={adminInputClassName}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-100">
                  Start time
                </span>
                <input
                  name="startTime"
                  type="datetime-local"
                  required
                  className={adminInputClassName}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-100">
                  Duration in minutes
                </span>
                <input
                  name="durationMinutes"
                  type="number"
                  min="1"
                  required
                  className={adminInputClassName}
                />
              </label>
              <button
                type="submit"
                disabled={isPending}
                className={primaryButtonClassName}
              >
                {isPending ? 'Working...' : 'Create draft'}
              </button>
            </form>
          </article>

          <article className={`${adminSurfaceClassName} p-6 sm:p-7`}>
            <p className={adminLabelClassName}>Setup Rules</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white">
              Event state rules remain unchanged
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <li>Draft events can be edited until they are activated.</li>
              <li>Only one event can be active at a time.</li>
              <li>Active events can only move to completed.</li>
              <li>Completed events can be archived for history.</li>
              <li>The board is fixed to the canonical honeycomb definition.</li>
            </ul>
            <div className={`${adminPanelClassName} mt-6 p-4`}>
              <p className={adminMutedLabelClassName}>Archive Snapshot</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {archivedEventCount} archived event
                {archivedEventCount === 1 ? '' : 's'} currently remain available
                for history review.
              </p>
            </div>
          </article>
        </section>

        <section className="mt-4 space-y-4">
          {events.length === 0 ? (
            <article
              className={`${adminSurfaceClassName} p-6 text-sm text-slate-300 sm:p-7`}
            >
              No events exist yet. Create a draft to begin the setup flow.
            </article>
          ) : null}

          {events.map((eventRow) => {
            const filters = getCompletionFilterState(eventRow.id)
            const filteredCompletions = eventRow.completions.filter(
              (completion) => {
                if (filters.teamId && completion.teamId !== filters.teamId) {
                  return false
                }

                if (
                  filters.userId &&
                  completion.completedByUserId !== filters.userId
                ) {
                  return false
                }

                if (filters.tileQuery) {
                  const query = filters.tileQuery.trim().toLowerCase()
                  const matchesTile =
                    completion.tileKey.toLowerCase().includes(query) ||
                    completion.tileLabel.toLowerCase().includes(query)

                  if (!matchesTile) {
                    return false
                  }
                }

                const completedAtMs = new Date(completion.completedAt).getTime()

                if (filters.startAt) {
                  const startAtMs = new Date(filters.startAt).getTime()

                  if (!Number.isNaN(startAtMs) && completedAtMs < startAtMs) {
                    return false
                  }
                }

                if (filters.endAt) {
                  const endAtMs = new Date(filters.endAt).getTime()

                  if (!Number.isNaN(endAtMs) && completedAtMs > endAtMs) {
                    return false
                  }
                }

                return true
              },
            )

            const completionUsers = eventRow.completions
              .map((completion) => ({
                id: completion.completedByUserId,
                label: completion.submittedByName,
              }))
              .filter(
                (user, index, users) =>
                  users.findIndex((candidate) => candidate.id === user.id) ===
                  index,
              )

            return (
              <article
                key={eventRow.id}
                className={`${adminSurfaceClassName} p-6 sm:p-7`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-[-0.03em] text-white">
                        {eventRow.name}
                      </h2>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusBadgeClassName(
                          eventRow.status,
                        )}`}
                      >
                        {formatStatusLabel(eventRow.status)}
                      </span>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                      Configure teams, review readiness, and inspect submissions
                      for this event without changing any workflow behavior.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                      <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-4 py-2">
                        Board: {eventRow.boardName ?? 'Missing'}
                      </span>
                      <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-4 py-2">
                        Version: {eventRow.boardVersion ?? 'Unknown'}
                      </span>
                      <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-4 py-2">
                        Start:{' '}
                        {eventRow.startTime
                          ? new Date(eventRow.startTime).toLocaleString()
                          : 'Missing'}
                      </span>
                      <span className="rounded-full border border-slate-400/15 bg-slate-900/70 px-4 py-2">
                        Duration: {eventRow.durationMinutes ?? 'Missing'}{' '}
                        minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {eventRow.nextStatuses.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={
                          isPending ||
                          (eventRow.status === 'draft' &&
                            eventRow.readinessIssues.length > 0 &&
                            nextStatus === 'active')
                        }
                        onClick={() => {
                          void handleStatusTransition(eventRow.id, nextStatus)
                        }}
                        className={secondaryButtonClassName}
                      >
                        Move to {formatStatusLabel(nextStatus)}
                      </button>
                    ))}
                  </div>
                </div>

                {eventRow.status === 'draft' ? (
                  <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
                    <form
                      className={`${adminPanelClassName} space-y-4 p-5 sm:p-6`}
                      onSubmit={(event) => {
                        event.preventDefault()
                        void handleUpdateDraft(
                          new FormData(event.currentTarget),
                        )
                      }}
                    >
                      <input type="hidden" name="eventId" value={eventRow.id} />
                      <p className={adminLabelClassName}>Draft Details</p>
                      <p className="text-sm font-semibold text-white">
                        Draft event details
                      </p>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-300">
                          Event name
                        </span>
                        <input
                          name="name"
                          type="text"
                          defaultValue={eventRow.name}
                          required
                          className={adminInputClassName}
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-300">
                          Start time
                        </span>
                        <input
                          name="startTime"
                          type="datetime-local"
                          defaultValue={toDateTimeLocalValue(
                            eventRow.startTime,
                          )}
                          required
                          className={adminInputClassName}
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-slate-300">
                          Duration in minutes
                        </span>
                        <input
                          name="durationMinutes"
                          type="number"
                          min="1"
                          defaultValue={eventRow.durationMinutes ?? ''}
                          required
                          className={adminInputClassName}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={isPending}
                        className={primaryButtonClassName}
                      >
                        {isPending ? 'Working...' : 'Save draft'}
                      </button>
                    </form>

                    <section className={`${adminPanelClassName} p-5 sm:p-6`}>
                      <p className={adminLabelClassName}>Activation</p>
                      <p className="text-sm font-semibold text-white">
                        Activation readiness
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        Activation is only allowed when the draft has a unique
                        name, a start time, a duration, and an attached
                        canonical board.
                      </p>
                      <ul className="mt-4 space-y-3 text-sm text-slate-300">
                        <li>
                          Board attached:{' '}
                          <strong className="text-white">
                            {eventRow.boardAttached ? 'Yes' : 'No'}
                          </strong>
                        </li>
                        {eventRow.readinessIssues.length === 0 ? (
                          <li className="font-medium text-emerald-200">
                            Ready to activate.
                          </li>
                        ) : (
                          eventRow.readinessIssues.map((issue) => (
                            <li key={issue} className="text-rose-200">
                              {issue}
                            </li>
                          ))
                        )}
                      </ul>
                    </section>
                  </div>
                ) : (
                  <section
                    className={`${adminPanelClassName} mt-6 p-5 text-sm leading-7 text-slate-300 sm:p-6`}
                  >
                    {eventRow.status === 'active'
                      ? 'This event is live. Event metadata and the attached board are now locked.'
                      : eventRow.status === 'completed'
                        ? 'This event is finished and can be archived for history.'
                        : 'This event is archived and remains read only.'}
                  </section>
                )}

                <div className="mt-6 grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
                  <section className={`${adminPanelClassName} p-5 sm:p-6`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={adminLabelClassName}>Teams</p>
                        <p className="text-sm font-semibold text-white">
                          Teams
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {eventRow.teams.length} teams configured for this
                          event.
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-400/15 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                        {eventRow.canManageTeams ? 'Editable' : 'Read only'}
                      </span>
                    </div>

                    {eventRow.canManageTeams ? (
                      <form
                        className="mt-5 flex flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => {
                          event.preventDefault()
                          void handleCreateTeam(
                            new FormData(event.currentTarget),
                          )
                        }}
                      >
                        <input
                          type="hidden"
                          name="eventId"
                          value={eventRow.id}
                        />
                        <input
                          name="name"
                          type="text"
                          placeholder="New team name"
                          required
                          className={`min-w-0 flex-1 ${adminInputClassName}`}
                        />
                        <button
                          type="submit"
                          disabled={isPending}
                          className={primaryButtonClassName}
                        >
                          Add team
                        </button>
                      </form>
                    ) : null}

                    <div className="mt-5 space-y-4">
                      {eventRow.teams.length === 0 ? (
                        <p className="text-sm text-slate-300">
                          No teams yet for this event.
                        </p>
                      ) : (
                        eventRow.teams.map((team) => (
                          <article
                            key={team.id}
                            className={`${adminInsetPanelClassName} p-4`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-white">
                                  {team.name}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {team.memberCount} members
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-3">
                              {team.members.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                  No members assigned.
                                </p>
                              ) : (
                                team.members.map((member) => (
                                  <div
                                    key={member.membershipId}
                                    className="rounded-2xl border border-slate-400/15 bg-slate-900/80 p-3"
                                  >
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-white">
                                          {member.name}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                          {member.email}
                                        </p>
                                      </div>
                                      {eventRow.canManageTeams ? (
                                        <form
                                          className="flex flex-col gap-2 sm:flex-row"
                                          onSubmit={(event) => {
                                            event.preventDefault()
                                            void handleAssignUser(
                                              new FormData(event.currentTarget),
                                            )
                                          }}
                                        >
                                          <input
                                            type="hidden"
                                            name="eventId"
                                            value={eventRow.id}
                                          />
                                          <input
                                            type="hidden"
                                            name="userId"
                                            value={member.userId}
                                          />
                                          <select
                                            name="teamId"
                                            defaultValue={team.id}
                                            className={adminSelectClassName}
                                          >
                                            {eventRow.teams.map(
                                              (teamOption) => (
                                                <option
                                                  key={teamOption.id}
                                                  value={teamOption.id}
                                                >
                                                  {teamOption.name}
                                                </option>
                                              ),
                                            )}
                                          </select>
                                          <button
                                            type="submit"
                                            disabled={isPending}
                                            className={secondaryButtonClassName}
                                          >
                                            Move
                                          </button>
                                        </form>
                                      ) : null}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </section>

                  <section className={`${adminPanelClassName} p-5 sm:p-6`}>
                    <p className={adminLabelClassName}>Assignments</p>
                    <p className="text-sm font-semibold text-white">
                      Unassigned users
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Users can stay unassigned until you place them on a team
                      for this event.
                    </p>

                    <div className="mt-5 space-y-3">
                      {eventRow.unassignedUsers.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          Everyone is currently assigned.
                        </p>
                      ) : (
                        eventRow.unassignedUsers.map((user) => (
                          <div
                            key={user.id}
                            className={`${adminInsetPanelClassName} p-4`}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {user.name}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {user.email}
                                </p>
                              </div>
                              {eventRow.canManageTeams &&
                              eventRow.teams.length > 0 ? (
                                <form
                                  className="flex flex-col gap-2 sm:flex-row"
                                  onSubmit={(event) => {
                                    event.preventDefault()
                                    void handleAssignUser(
                                      new FormData(event.currentTarget),
                                    )
                                  }}
                                >
                                  <input
                                    type="hidden"
                                    name="eventId"
                                    value={eventRow.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="userId"
                                    value={user.id}
                                  />
                                  <select
                                    name="teamId"
                                    required
                                    defaultValue=""
                                    className={adminSelectClassName}
                                  >
                                    <option value="" disabled>
                                      Select team
                                    </option>
                                    {eventRow.teams.map((team) => (
                                      <option key={team.id} value={team.id}>
                                        {team.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="submit"
                                    disabled={isPending}
                                    className={primaryButtonClassName}
                                  >
                                    Assign
                                  </button>
                                </form>
                              ) : eventRow.teams.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                  Create a team first.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <section className={`${adminPanelClassName} mt-6 p-5 sm:p-6`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className={adminLabelClassName}>Inspection</p>
                      <p className="text-sm font-semibold text-white">
                        Completion inspection
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        Filter submissions by team, user, tile, or time and
                        invalidate bad rows where the event still allows it.
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-400/15 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {eventRow.completions.length} submissions
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <label className="space-y-2">
                      <span className={adminMutedLabelClassName}>Team</span>
                      <select
                        value={filters.teamId}
                        onChange={(event) => {
                          updateCompletionFilter(
                            eventRow.id,
                            'teamId',
                            event.target.value,
                          )
                        }}
                        className={`w-full ${adminSelectClassName}`}
                      >
                        <option value="">All teams</option>
                        {eventRow.teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className={adminMutedLabelClassName}>User</span>
                      <select
                        value={filters.userId}
                        onChange={(event) => {
                          updateCompletionFilter(
                            eventRow.id,
                            'userId',
                            event.target.value,
                          )
                        }}
                        className={`w-full ${adminSelectClassName}`}
                      >
                        <option value="">All users</option>
                        {completionUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className={adminMutedLabelClassName}>Tile</span>
                      <input
                        type="text"
                        value={filters.tileQuery}
                        onChange={(event) => {
                          updateCompletionFilter(
                            eventRow.id,
                            'tileQuery',
                            event.target.value,
                          )
                        }}
                        placeholder="Tile key or label"
                        className={adminInputClassName}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className={adminMutedLabelClassName}>From</span>
                      <input
                        type="datetime-local"
                        value={filters.startAt}
                        onChange={(event) => {
                          updateCompletionFilter(
                            eventRow.id,
                            'startAt',
                            event.target.value,
                          )
                        }}
                        className={adminInputClassName}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className={adminMutedLabelClassName}>To</span>
                      <input
                        type="datetime-local"
                        value={filters.endAt}
                        onChange={(event) => {
                          updateCompletionFilter(
                            eventRow.id,
                            'endAt',
                            event.target.value,
                          )
                        }}
                        className={adminInputClassName}
                      />
                    </label>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-300">
                      <thead>
                        <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          <th className="px-3">Time</th>
                          <th className="px-3">Team</th>
                          <th className="px-3">User</th>
                          <th className="px-3">Tile</th>
                          <th className="px-3">Proof</th>
                          <th className="px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompletions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="rounded-2xl border border-slate-400/15 bg-slate-950/70 px-4 py-5 text-center text-sm text-slate-400"
                            >
                              No submissions match the current filters.
                            </td>
                          </tr>
                        ) : (
                          filteredCompletions.map((completion) => (
                            <tr key={completion.id}>
                              <td className="rounded-l-2xl border border-r-0 border-slate-400/15 bg-slate-950/70 px-3 py-4">
                                {new Date(
                                  completion.completedAt,
                                ).toLocaleString()}
                              </td>
                              <td className="border border-l-0 border-r-0 border-slate-400/15 bg-slate-950/70 px-3 py-4">
                                {completion.teamName}
                              </td>
                              <td className="border border-l-0 border-r-0 border-slate-400/15 bg-slate-950/70 px-3 py-4">
                                <p className="font-medium text-white">
                                  {completion.submittedByName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {completion.submittedByEmail}
                                </p>
                              </td>
                              <td className="border border-l-0 border-r-0 border-slate-400/15 bg-slate-950/70 px-3 py-4">
                                <p className="font-medium text-white">
                                  {completion.tileKey}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {completion.tileLabel}
                                </p>
                              </td>
                              <td className="border border-l-0 border-r-0 border-slate-400/15 bg-slate-950/70 px-3 py-4">
                                <a
                                  href={completion.proofUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-300 underline decoration-cyan-400/40 underline-offset-4 hover:text-cyan-200"
                                >
                                  Open proof
                                </a>
                              </td>
                              <td className="rounded-r-2xl border border-l-0 border-slate-400/15 bg-slate-950/70 px-3 py-4">
                                {eventRow.canInvalidateCompletions ? (
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => {
                                      void handleInvalidateCompletion(
                                        completion.id,
                                      )
                                    }}
                                    className={dangerButtonClassName}
                                  >
                                    Invalidate
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500">
                                    Locked
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
