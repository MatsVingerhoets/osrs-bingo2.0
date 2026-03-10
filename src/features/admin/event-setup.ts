import { createServerFn } from '@tanstack/react-start'
import { CANONICAL_BOARD_KEY } from '#/features/board/canonical-board'
import {
  canTransitionEventStatus,
  getDraftEventReadinessIssues,
  getNextEventStatuses,
} from '#/domain/event-setup'
import { getCurrentAuth } from '#/server/auth/current-auth'
import { canEditBoardDefinition, canInvalidateCompletion } from '#/domain/event-state'
import { findBoardByEventId } from '#/repositories/board-repository'
import {
  deleteTeamTileCompletion,
  findTeamTileCompletionById,
  listCompletionInspectionRows,
} from '#/repositories/completion-repository'
import {
  createEvent,
  findEventById,
  findEventByName,
  findEventByStatus,
  listEvents,
  updateEvent,
} from '#/repositories/event-repository'
import { listUsers } from '#/repositories/user-repository'
import {
  assignTeamMembership,
  createTeam,
  findTeamById,
  listTeamMembershipsByEvent,
  listTeamsByEvent,
} from '#/repositories/team-repository'
import type { EventStatus } from '#/models/db'

type DraftEventInput = {
  name: string
  startTime: string
  durationMinutes: number
}

type TeamInput = {
  eventId: string
  name: string
}

type TeamAssignmentInput = {
  eventId: string
  teamId: string
  userId: string
}

type InvalidateCompletionInput = {
  completionId: string
}

function normalizeName(name: string) {
  return name.trim()
}

function normalizeTeamName(name: string) {
  const value = name.trim()

  if (value.length === 0) {
    throw new Error('Team name is required')
  }

  return value
}

function normalizeStartTime(startTime: string) {
  const value = startTime.trim()

  if (value.length === 0) {
    throw new Error('Start time is required')
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Start time is invalid')
  }

  return parsed.toISOString()
}

function normalizeDurationMinutes(durationMinutes: number) {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error('Duration must be greater than zero minutes')
  }

  return Math.trunc(durationMinutes)
}

async function requireAdmin() {
  const auth = await getCurrentAuth()

  if (!auth || !auth.roles.includes('ADMIN')) {
    throw new Error('Admin access is required')
  }

  return auth
}

async function assertUniqueEventName(name: string, excludeEventId?: string) {
  const existingEvent = await findEventByName(name)

  if (existingEvent && existingEvent.id !== excludeEventId) {
    throw new Error('Event name must be unique')
  }
}

async function getDraftReadiness(eventId: string) {
  const event = await findEventById(eventId)

  if (!event) {
    throw new Error('Event not found')
  }

  const board = await findBoardByEventId(event.id)

  return getDraftEventReadinessIssues({
    name: event.name,
    startTime: event.start_time,
    durationMinutes: event.duration_minutes,
    boardAttached: Boolean(board),
  })
}

async function requireManageableEvent(eventId: string) {
  const event = await findEventById(eventId)

  if (!event) {
    throw new Error('Event not found')
  }

  if (!canEditBoardDefinition(event.status) && event.status !== 'active') {
    throw new Error('Teams can only be managed for draft or active events')
  }

  return event
}

export const getAdminEventSetupData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await requireAdmin()
    const events = await listEvents()
    const users = await listUsers()

    const eventRows = await Promise.all(
      events.map(async (event) => {
        const board = await findBoardByEventId(event.id)
        const teams = await listTeamsByEvent(event.id)
        const memberships = await listTeamMembershipsByEvent(event.id)
        const completions = await listCompletionInspectionRows(event.id)
        const readinessIssues =
          event.status === 'draft'
            ? getDraftEventReadinessIssues({
                name: event.name,
                startTime: event.start_time,
                durationMinutes: event.duration_minutes,
                boardAttached: Boolean(board),
              })
            : []
        const teamRows = teams.map((team) => ({
          id: team.id,
          name: team.name,
          memberCount: memberships.filter(
            (membership) => membership.team_id === team.id,
          ).length,
          members: memberships
            .filter((membership) => membership.team_id === team.id)
            .map((membership) => ({
              membershipId: membership.id,
              userId: membership.user_id,
              name: membership.user_name,
              email: membership.user_email,
            })),
        }))
        const assignedUserIds = new Set(memberships.map((membership) => membership.user_id))
        const unassignedUsers = users
          .filter((user) => !assignedUserIds.has(user.id))
          .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
          }))

        return {
          id: event.id,
          name: event.name,
          status: event.status,
          startTime: event.start_time,
          durationMinutes: event.duration_minutes,
          boardKey: event.board_key,
          boardAttached: Boolean(board),
          boardName: board?.name ?? null,
          boardVersion: board?.version ?? null,
          nextStatuses: getNextEventStatuses(event.status),
          readinessIssues,
          canManageTeams:
            canEditBoardDefinition(event.status) || event.status === 'active',
          teams: teamRows,
          unassignedUsers,
          canInvalidateCompletions: canInvalidateCompletion(event.status),
          completions: completions.map((completion) => ({
            id: completion.id,
            eventId: completion.event_id,
            teamId: completion.team_id,
            teamName: completion.team_name,
            boardTileId: completion.board_tile_id,
            completedByUserId: completion.completed_by_user_id,
            submittedByName: completion.submitted_by_name,
            submittedByEmail: completion.submitted_by_email,
            proofUrl: completion.proof_url,
            completedAt: completion.completed_at,
            tileLabel: completion.tile_label,
            tileKey: completion.tile_key,
          })),
        }
      }),
    )

    return {
      auth,
      events: eventRows,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    }
  },
)

export const createDraftEvent = createServerFn({ method: 'POST' })
  .inputValidator((input: DraftEventInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin()

    const name = normalizeName(data.name)
    const startTime = normalizeStartTime(data.startTime)
    const durationMinutes = normalizeDurationMinutes(data.durationMinutes)

    if (name.length === 0) {
      throw new Error('Event name is required')
    }

    await assertUniqueEventName(name)

    return createEvent({
      name,
      status: 'draft',
      start_time: startTime,
      duration_minutes: durationMinutes,
      board_key: CANONICAL_BOARD_KEY,
    })
  })

export const updateDraftEvent = createServerFn({ method: 'POST' })
  .inputValidator((input: DraftEventInput & { eventId: string }) => input)
  .handler(async ({ data }) => {
    await requireAdmin()

    const event = await findEventById(data.eventId)

    if (!event) {
      throw new Error('Event not found')
    }

    if (event.status !== 'draft') {
      throw new Error('Only draft events can be edited')
    }

    const name = normalizeName(data.name)
    const startTime = normalizeStartTime(data.startTime)
    const durationMinutes = normalizeDurationMinutes(data.durationMinutes)

    if (name.length === 0) {
      throw new Error('Event name is required')
    }

    await assertUniqueEventName(name, event.id)

    const updatedEvent = await updateEvent(event.id, {
      name,
      start_time: startTime,
      duration_minutes: durationMinutes,
    })

    if (!updatedEvent) {
      throw new Error('Event could not be updated')
    }

    return updatedEvent
  })

export const transitionEventStatus = createServerFn({ method: 'POST' })
  .inputValidator((input: { eventId: string; toStatus: EventStatus }) => input)
  .handler(async ({ data }) => {
    await requireAdmin()

    const event = await findEventById(data.eventId)

    if (!event) {
      throw new Error('Event not found')
    }

    if (!canTransitionEventStatus(event.status, data.toStatus)) {
      throw new Error(
        `Cannot transition event from ${event.status} to ${data.toStatus}`,
      )
    }

    if (data.toStatus === 'active') {
      const activeEvent = await findEventByStatus('active')

      if (activeEvent && activeEvent.id !== event.id) {
        throw new Error('Only one active event is allowed at a time')
      }

      const readinessIssues = await getDraftReadiness(event.id)

      if (readinessIssues.length > 0) {
        throw new Error(readinessIssues[0] ?? 'Draft event is not ready')
      }
    }

    const updatedEvent = await updateEvent(event.id, {
      status: data.toStatus,
    })

    if (!updatedEvent) {
      throw new Error('Event status could not be updated')
    }

    return updatedEvent
  })

export const createEventTeam = createServerFn({ method: 'POST' })
  .inputValidator((input: TeamInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin()
    await requireManageableEvent(data.eventId)

    try {
      return await createTeam({
        event_id: data.eventId,
        name: normalizeTeamName(data.name),
      })
    } catch (error) {
      if (
        error instanceof Error &&
        /teams_event_id_name_unique|duplicate key/i.test(error.message)
      ) {
        throw new Error('Team name must be unique within the event')
      }

      throw error
    }
  })

export const assignUserToEventTeam = createServerFn({ method: 'POST' })
  .inputValidator((input: TeamAssignmentInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin()
    await requireManageableEvent(data.eventId)

    const team = await findTeamById(data.teamId)

    if (!team || team.event_id !== data.eventId) {
      throw new Error('Team does not belong to the selected event')
    }

    const users = await listUsers()
    const user = users.find((candidate) => candidate.id === data.userId)

    if (!user) {
      throw new Error('User not found')
    }

    return assignTeamMembership({
      event_id: data.eventId,
      team_id: data.teamId,
      user_id: data.userId,
    })
  })

export const invalidateCompletion = createServerFn({ method: 'POST' })
  .inputValidator((input: InvalidateCompletionInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin()

    const completion = await findTeamTileCompletionById(data.completionId)

    if (!completion) {
      throw new Error('Completion not found')
    }

    const event = await findEventById(completion.event_id)

    if (!event) {
      throw new Error('Event not found')
    }

    if (!canInvalidateCompletion(event.status)) {
      throw new Error('Completions can only be invalidated for active or completed events')
    }

    const deleted = await deleteTeamTileCompletion(completion.id)

    if (!deleted) {
      throw new Error('Completion could not be invalidated')
    }

    return deleted
  })
