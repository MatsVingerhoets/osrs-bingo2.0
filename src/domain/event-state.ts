import type { EventStatus } from '#/models/db'

export function isEventPlayable(status: EventStatus) {
  return status === 'active'
}

export function canEditBoardDefinition(status: EventStatus) {
  return status === 'draft'
}

export function canViewBoard(status: EventStatus) {
  return status === 'active' || status === 'completed' || status === 'archived'
}

export function canSubmitTeamCompletion(status: EventStatus) {
  return status === 'active'
}

export function canInvalidateCompletion(status: EventStatus) {
  return status === 'active' || status === 'completed'
}
