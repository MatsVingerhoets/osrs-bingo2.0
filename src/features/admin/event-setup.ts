import { createServerFn } from '@tanstack/react-start'
import { CANONICAL_BOARD_KEY } from '#/features/board/canonical-board'
import {
  canTransitionEventStatus,
  getDraftEventReadinessIssues,
  getNextEventStatuses,
} from '#/domain/event-setup'
import { getCurrentAuth } from '#/server/auth/current-auth'
import { findBoardByEventId } from '#/repositories/board-repository'
import {
  createEvent,
  findEventById,
  findEventByName,
  findEventByStatus,
  listEvents,
  updateEvent,
} from '#/repositories/event-repository'
import type { EventStatus } from '#/models/db'

type DraftEventInput = {
  name: string
  startTime: string
  durationMinutes: number
}

function normalizeName(name: string) {
  return name.trim()
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

export const getAdminEventSetupData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await requireAdmin()
    const events = await listEvents()

    const eventRows = await Promise.all(
      events.map(async (event) => {
        const board = await findBoardByEventId(event.id)
        const readinessIssues =
          event.status === 'draft'
            ? getDraftEventReadinessIssues({
                name: event.name,
                startTime: event.start_time,
                durationMinutes: event.duration_minutes,
                boardAttached: Boolean(board),
              })
            : []

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
        }
      }),
    )

    return {
      auth,
      events: eventRows,
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
