import type { EventStatus } from '#/models/db'

const EVENT_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['active'],
  active: ['completed'],
  completed: ['archived'],
  archived: [],
}

export function canTransitionEventStatus(
  from: EventStatus,
  to: EventStatus,
): boolean {
  return EVENT_STATUS_TRANSITIONS[from].includes(to)
}

export function getNextEventStatuses(status: EventStatus): EventStatus[] {
  return [...EVENT_STATUS_TRANSITIONS[status]]
}

export type EventReadinessInput = {
  name: string
  startTime: string | null
  durationMinutes: number | null
  boardAttached: boolean
}

export function getDraftEventReadinessIssues(input: EventReadinessInput) {
  const issues: string[] = []

  if (input.name.trim().length === 0) {
    issues.push('Event name is required.')
  }

  if (!input.startTime) {
    issues.push('Start time is required.')
  }

  if (input.durationMinutes === null || input.durationMinutes <= 0) {
    issues.push('Duration must be greater than zero minutes.')
  }

  if (!input.boardAttached) {
    issues.push('The canonical board is not attached to this event.')
  }

  return issues
}
