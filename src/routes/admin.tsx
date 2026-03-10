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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              Admin Event Setup
            </p>
            <h1 className="mt-4 font-['Sora',var(--font-sans)] text-4xl font-bold tracking-[-0.04em] text-stone-950">
              Phase 8 replaces seed events with explicit setup.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700">
              Signed in as <strong>{auth.name}</strong>. Drafts stay editable,
              activation is blocked until required fields are present, and live
              events become read only.
            </p>
          </div>
          <div className="rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.72)] px-5 py-4 text-sm text-stone-700">
            <p>
              Roles: <strong>{auth.roles.join(', ')}</strong>
            </p>
            <p className="mt-1">
              Canonical board: <strong>OSRS Honeycomb</strong>
            </p>
          </div>
        </div>

        {feedback ? (
          <p className="mt-6 rounded-2xl border border-[#627543]/20 bg-[#627543]/8 px-4 py-3 text-sm font-medium text-[#4f6035]">
            {feedback}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-2xl border border-[#9b3d26]/20 bg-[#9b3d26]/8 px-4 py-3 text-sm font-medium text-[#7c2e1a]">
            {error}
          </p>
        ) : null}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Create Draft
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            Start setup before the event goes live
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone-700">
            New events start in <code>draft</code> with the canonical honeycomb
            board attached automatically. The event name must be unique.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleCreateDraft(new FormData(event.currentTarget))
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-800">
                Event name
              </span>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-[rgba(255,252,248,0.86)] px-4 py-3 text-sm text-stone-900 outline-none"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-800">
                Start time
              </span>
              <input
                name="startTime"
                type="datetime-local"
                required
                className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-[rgba(255,252,248,0.86)] px-4 py-3 text-sm text-stone-900 outline-none"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-800">
                Duration in minutes
              </span>
              <input
                name="durationMinutes"
                type="number"
                min="1"
                required
                className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-[rgba(255,252,248,0.86)] px-4 py-3 text-sm text-stone-900 outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[#97510f] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'Working...' : 'Create draft'}
            </button>
          </form>
        </article>

        <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Setup Rules
          </p>
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            <li>Draft events can be edited until they are activated.</li>
            <li>Only one event can be active at a time.</li>
            <li>Active events can only move to completed.</li>
            <li>Completed events can be archived for history.</li>
            <li>The board is fixed to the canonical honeycomb definition.</li>
          </ul>
        </article>
      </section>

      <section className="mt-8 space-y-5">
        {events.length === 0 ? (
          <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 text-sm text-stone-700 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
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
              className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]"
            >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-stone-950">
                    {eventRow.name}
                  </h2>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      eventRow.status === 'active'
                        ? 'border-[#97510f]/20 bg-[#97510f]/8 text-[#97510f]'
                        : eventRow.status === 'draft'
                          ? 'border-[#627543]/20 bg-[#627543]/8 text-[#4f6035]'
                          : 'border-stone-300 bg-white/40 text-stone-600'
                    }`}
                  >
                    {formatStatusLabel(eventRow.status)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-600">
                  <span className="rounded-full border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-2">
                    Board: {eventRow.boardName ?? 'Missing'}
                  </span>
                  <span className="rounded-full border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-2">
                    Version: {eventRow.boardVersion ?? 'Unknown'}
                  </span>
                  <span className="rounded-full border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-2">
                    Start:{' '}
                    {eventRow.startTime
                      ? new Date(eventRow.startTime).toLocaleString()
                      : 'Missing'}
                  </span>
                  <span className="rounded-full border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-2">
                    Duration: {eventRow.durationMinutes ?? 'Missing'} minutes
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
                    className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(255,248,238,0.92)] px-5 py-2.5 text-sm font-semibold text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move to {formatStatusLabel(nextStatus)}
                  </button>
                ))}
              </div>
            </div>

            {eventRow.status === 'draft' ? (
              <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                <form
                  className="space-y-4 rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.68)] p-6"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleUpdateDraft(new FormData(event.currentTarget))
                  }}
                >
                  <input type="hidden" name="eventId" value={eventRow.id} />
                  <p className="text-sm font-semibold text-stone-900">
                    Draft event details
                  </p>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-stone-700">
                      Event name
                    </span>
                    <input
                      name="name"
                      type="text"
                      defaultValue={eventRow.name}
                      required
                      className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-stone-700">
                      Start time
                    </span>
                    <input
                      name="startTime"
                      type="datetime-local"
                      defaultValue={toDateTimeLocalValue(eventRow.startTime)}
                      required
                      className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-stone-700">
                      Duration in minutes
                    </span>
                    <input
                      name="durationMinutes"
                      type="number"
                      min="1"
                      defaultValue={eventRow.durationMinutes ?? ''}
                      required
                      className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[#97510f] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? 'Working...' : 'Save draft'}
                  </button>
                </form>

                <section className="rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.68)] p-6">
                  <p className="text-sm font-semibold text-stone-900">
                    Activation readiness
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-700">
                    Activation is only allowed when the draft has a unique name,
                    a start time, a duration, and an attached canonical board.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-stone-700">
                    <li>
                      Board attached:{' '}
                      <strong>{eventRow.boardAttached ? 'Yes' : 'No'}</strong>
                    </li>
                    {eventRow.readinessIssues.length === 0 ? (
                      <li className="font-medium text-[#4f6035]">
                        Ready to activate.
                      </li>
                    ) : (
                      eventRow.readinessIssues.map((issue) => (
                        <li key={issue} className="text-[#7c2e1a]">
                          {issue}
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              </div>
            ) : (
              <section className="mt-8 rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.68)] p-6 text-sm leading-7 text-stone-700">
                {eventRow.status === 'active'
                  ? 'This event is live. Event metadata and the attached board are now locked.'
                  : eventRow.status === 'completed'
                    ? 'This event is finished and can be archived for history.'
                    : 'This event is archived and remains read only.'}
              </section>
            )}

            <div className="mt-8 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
              <section className="rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.68)] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      Teams
                    </p>
                    <p className="mt-1 text-sm text-stone-700">
                      {eventRow.teams.length} teams configured for this event.
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600">
                    {eventRow.canManageTeams ? 'Editable' : 'Read only'}
                  </span>
                </div>

                {eventRow.canManageTeams ? (
                  <form
                    className="mt-5 flex flex-col gap-3 sm:flex-row"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void handleCreateTeam(new FormData(event.currentTarget))
                    }}
                  >
                    <input type="hidden" name="eventId" value={eventRow.id} />
                    <input
                      name="name"
                      type="text"
                      placeholder="New team name"
                      required
                      className="min-w-0 flex-1 rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[#97510f] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add team
                    </button>
                  </form>
                ) : null}

                <div className="mt-5 space-y-4">
                  {eventRow.teams.length === 0 ? (
                    <p className="text-sm text-stone-700">
                      No teams yet for this event.
                    </p>
                  ) : (
                    eventRow.teams.map((team) => (
                      <article
                        key={team.id}
                        className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-white/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-900">
                              {team.name}
                            </p>
                            <p className="text-sm text-stone-600">
                              {team.memberCount} members
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {team.members.length === 0 ? (
                            <p className="text-sm text-stone-600">
                              No members assigned.
                            </p>
                          ) : (
                            team.members.map((member) => (
                              <div
                                key={member.membershipId}
                                className="rounded-2xl border border-[rgba(87,57,24,0.1)] bg-[rgba(255,248,238,0.72)] p-3"
                              >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-stone-900">
                                      {member.name}
                                    </p>
                                    <p className="text-sm text-stone-600">
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
                                        className="rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-2.5 text-sm text-stone-900 outline-none"
                                      >
                                        {eventRow.teams.map((teamOption) => (
                                          <option
                                            key={teamOption.id}
                                            value={teamOption.id}
                                          >
                                            {teamOption.name}
                                          </option>
                                        ))}
                                      </select>
                                      <button
                                        type="submit"
                                        disabled={isPending}
                                        className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(255,248,238,0.92)] px-4 py-2.5 text-sm font-semibold text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
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

              <section className="rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.68)] p-6">
                <p className="text-sm font-semibold text-stone-900">
                  Unassigned users
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  Users can stay unassigned until you place them on a team for
                  this event.
                </p>

                <div className="mt-5 space-y-3">
                  {eventRow.unassignedUsers.length === 0 ? (
                    <p className="text-sm text-stone-600">
                      Everyone is currently assigned.
                    </p>
                  ) : (
                    eventRow.unassignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-white/70 p-4"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-medium text-stone-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-stone-600">
                              {user.email}
                            </p>
                          </div>
                          {eventRow.canManageTeams && eventRow.teams.length > 0 ? (
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
                              <input type="hidden" name="userId" value={user.id} />
                              <select
                                name="teamId"
                                required
                                defaultValue=""
                                className="rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-2.5 text-sm text-stone-900 outline-none"
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
                                className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(255,248,238,0.92)] px-4 py-2.5 text-sm font-semibold text-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Assign
                              </button>
                            </form>
                          ) : eventRow.teams.length === 0 ? (
                            <p className="text-sm text-stone-600">
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

            <section className="mt-8 rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.68)] p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Completion inspection
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Filter submissions by team, user, tile, or time and
                    invalidate bad rows where the event still allows it.
                  </p>
                </div>
                <span className="rounded-full border border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600">
                  {eventRow.completions.length} submissions
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Team
                  </span>
                  <select
                    value={filters.teamId}
                    onChange={(event) => {
                      updateCompletionFilter(
                        eventRow.id,
                        'teamId',
                        event.target.value,
                      )
                    }}
                    className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
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
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    User
                  </span>
                  <select
                    value={filters.userId}
                    onChange={(event) => {
                      updateCompletionFilter(
                        eventRow.id,
                        'userId',
                        event.target.value,
                      )
                    }}
                    className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
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
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Tile
                  </span>
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
                    className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    From
                  </span>
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
                    className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    To
                  </span>
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
                    className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none"
                  />
                </label>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-stone-700">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.2em] text-stone-500">
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
                          className="rounded-2xl border border-[rgba(87,57,24,0.12)] bg-white/70 px-4 py-5 text-center text-sm text-stone-600"
                        >
                          No submissions match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCompletions.map((completion) => (
                        <tr key={completion.id}>
                          <td className="rounded-l-2xl border border-r-0 border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-4">
                            {new Date(completion.completedAt).toLocaleString()}
                          </td>
                          <td className="border border-l-0 border-r-0 border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-4">
                            {completion.teamName}
                          </td>
                          <td className="border border-l-0 border-r-0 border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-4">
                            <p className="font-medium text-stone-900">
                              {completion.submittedByName}
                            </p>
                            <p className="text-xs text-stone-500">
                              {completion.submittedByEmail}
                            </p>
                          </td>
                          <td className="border border-l-0 border-r-0 border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-4">
                            <p className="font-medium text-stone-900">
                              {completion.tileKey}
                            </p>
                            <p className="text-xs text-stone-500">
                              {completion.tileLabel}
                            </p>
                          </td>
                          <td className="border border-l-0 border-r-0 border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-4">
                            <a
                              href={completion.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#97510f] underline"
                            >
                              Open proof
                            </a>
                          </td>
                          <td className="rounded-r-2xl border border-l-0 border-[rgba(87,57,24,0.12)] bg-white/70 px-3 py-4">
                            {eventRow.canInvalidateCompletions ? (
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                  void handleInvalidateCompletion(
                                    completion.id,
                                  )
                                }}
                                className="rounded-full border border-[#9b3d26]/20 bg-[#9b3d26]/8 px-4 py-2 text-xs font-semibold text-[#7c2e1a] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Invalidate
                              </button>
                            ) : (
                              <span className="text-xs text-stone-500">
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
    </main>
  )
}
