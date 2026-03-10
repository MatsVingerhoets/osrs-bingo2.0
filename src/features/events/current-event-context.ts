import { createServerFn } from '@tanstack/react-start'
import {
  deriveTeamScore,
  deriveUserContributions,
  getBoardTileStateMap,
} from '#/domain/board-state'
import { canSubmitTeamCompletion, canViewBoard } from '#/domain/event-state'
import { getAppSession } from '#/lib/session/app-session'
import type { JsonValue } from '#/models/db'
import {
  findBoardByEventId,
  listBoardTiles,
} from '#/repositories/board-repository'
import { listTeamTileCompletions } from '#/repositories/completion-repository'
import { findEventByStatus } from '#/repositories/event-repository'
import { findTeamMembershipByEventAndUser } from '#/repositories/team-repository'

type BoardLayoutMetadata = {
  initialVisibleTileKeys: string[]
  rowCounts: number[]
  rowShifts: number[]
}

type CurrentEventSummary = {
  id: string
  name: string
  status: string
  startTime: string | null
  durationMinutes: number | null
  boardKey: string | null
}

type CurrentTeamSummary = {
  id: string
  name: string
}

type CurrentBoardTile = {
  id: string
  tileKey: string
  label: string
  points: number
  colorTier: string
  rowIndex: number
  columnIndex: number
  state: 'hidden' | 'unlocked' | 'completed'
}

type CurrentCompletion = {
  id: string
  tileKey: string
  tileLabel: string
  tilePoints: number
  completedAt: string
  completedByUserId: string
  completedByName: string
  proofUrl: string
}

function toIsoString(value: string | Date | null) {
  if (!value) {
    return null
  }

  return value instanceof Date ? value.toISOString() : value
}

type CurrentEventContext =
  | {
      kind: 'no-active-event'
    }
  | {
      kind: 'no-team'
      event: CurrentEventSummary
    }
  | {
      kind: 'ready'
      event: CurrentEventSummary
      team: CurrentTeamSummary
      board: {
        id: string
        key: string
        name: string
        version: string
        layout: BoardLayoutMetadata
        visibleTileCount: number
        completedTileCount: number
        totalTileCount: number
        score: number
        canView: boolean
        canSubmit: boolean
        tiles: CurrentBoardTile[]
      }
      completions: CurrentCompletion[]
      contributions: {
        userId: string
        score: number
        completedTileCount: number
        tileKeys: string[]
      }[]
    }

function assertBoardLayoutMetadata(layoutJson: JsonValue): BoardLayoutMetadata {
  if (
    !layoutJson ||
    typeof layoutJson !== 'object' ||
    Array.isArray(layoutJson)
  ) {
    throw new Error('Board layout metadata is missing or invalid')
  }

  const initialVisibleTileKeys = layoutJson.initialVisibleTileKeys
  const rowCounts = layoutJson.rowCounts
  const rowShifts = layoutJson.rowShifts

  if (
    !Array.isArray(initialVisibleTileKeys) ||
    !initialVisibleTileKeys.every((tileKey) => typeof tileKey === 'string')
  ) {
    throw new Error('Board layout metadata is missing initialVisibleTileKeys')
  }

  if (
    !Array.isArray(rowCounts) ||
    !rowCounts.every((count) => typeof count === 'number')
  ) {
    throw new Error('Board layout metadata is missing rowCounts')
  }

  if (
    !Array.isArray(rowShifts) ||
    !rowShifts.every((count) => typeof count === 'number')
  ) {
    throw new Error('Board layout metadata is missing rowShifts')
  }

  return {
    initialVisibleTileKeys,
    rowCounts,
    rowShifts,
  }
}

function toEventSummary(
  event: Awaited<ReturnType<typeof findEventByStatus>>,
): CurrentEventSummary {
  if (!event) {
    throw new Error('Expected active event to exist')
  }

  return {
    id: event.id,
    name: event.name,
    status: event.status,
    startTime: toIsoString(event.start_time),
    durationMinutes: event.duration_minutes,
    boardKey: event.board_key,
  }
}

export const getCurrentEventContext = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CurrentEventContext> => {
    const session = await getAppSession()
    const userId = session.data.userId

    if (!userId) {
      return { kind: 'no-active-event' }
    }

    const event = await findEventByStatus('active')

    if (!event) {
      return { kind: 'no-active-event' }
    }

    const membership = await findTeamMembershipByEventAndUser(event.id, userId)

    if (!membership) {
      return {
        kind: 'no-team',
        event: toEventSummary(event),
      }
    }

    const board = await findBoardByEventId(event.id)

    if (!board) {
      throw new Error(`Active event ${event.id} is missing an imported board`)
    }

    const layout = assertBoardLayoutMetadata(board.layout_json)
    const boardTiles = await listBoardTiles(board.id)
    const completions = await listTeamTileCompletions(
      event.id,
      membership.team_id,
    )
    const tileStateMap = getBoardTileStateMap(
      boardTiles.map((tile) => ({
        tile_key: tile.tile_key,
        adjacent_tile_keys: tile.adjacent_tile_keys,
        points: tile.points,
      })),
      completions.map((completion) => ({
        tile_key: completion.tile_key,
        completed_by_user_id: completion.completed_by_user_id,
      })),
      layout,
    )

    const contributions = deriveUserContributions(
      boardTiles.map((tile) => ({
        tile_key: tile.tile_key,
        adjacent_tile_keys: tile.adjacent_tile_keys,
        points: tile.points,
      })),
      completions.map((completion) => ({
        tile_key: completion.tile_key,
        completed_by_user_id: completion.completed_by_user_id,
      })),
    )

    const score = deriveTeamScore(
      boardTiles.map((tile) => ({
        tile_key: tile.tile_key,
        adjacent_tile_keys: tile.adjacent_tile_keys,
        points: tile.points,
      })),
      completions.map((completion) => ({
        tile_key: completion.tile_key,
        completed_by_user_id: completion.completed_by_user_id,
      })),
    )

    const visibleTileCount = Object.values(tileStateMap).filter(
      (state) => state !== 'hidden',
    ).length

    const completedTileCount = Object.values(tileStateMap).filter(
      (state) => state === 'completed',
    ).length

    return {
      kind: 'ready',
      event: toEventSummary(event),
      team: {
        id: membership.team_id,
        name: membership.team_name,
      },
      board: {
        id: board.id,
        key: board.key,
        name: board.name,
        version: board.version,
        layout,
        visibleTileCount,
        completedTileCount,
        totalTileCount: boardTiles.length,
        score,
        canView: canViewBoard(event.status),
        canSubmit: canSubmitTeamCompletion(event.status),
        tiles: boardTiles.map((tile) => ({
          id: tile.id,
          tileKey: tile.tile_key,
          label: tile.label,
          points: tile.points,
          colorTier: tile.color_tier,
          rowIndex: tile.row_index,
          columnIndex: tile.column_index,
          state: tileStateMap[tile.tile_key],
        })),
      },
      completions: completions.map((completion) => ({
        id: completion.id,
        tileKey: completion.tile_key,
        tileLabel: completion.tile_label,
        tilePoints: completion.tile_points,
        completedAt: toIsoString(completion.completed_at) ?? '',
        completedByUserId: completion.completed_by_user_id,
        completedByName: completion.completed_by_name,
        proofUrl: completion.proof_url,
      })),
      contributions,
    }
  },
)
