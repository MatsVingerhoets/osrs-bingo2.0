import { createServerFn } from '@tanstack/react-start'
import {
  deriveTeamScore,
  deriveUserContributions,
  getBoardTileStateMap,
} from '#/domain/board-state'
import { deriveEventStandings } from '#/domain/standings'
import { canSubmitTeamCompletion, canViewBoard } from '#/domain/event-state'
import { getAppSession } from '#/lib/session/app-session'
import type { JsonValue } from '#/models/db'
import {
  findBoardByEventId,
  listBoardTiles,
} from '#/repositories/board-repository'
import {
  listEventTileCompletions,
  listTeamTileCompletions,
} from '#/repositories/completion-repository'
import { findEventByStatus } from '#/repositories/event-repository'
import {
  findTeamMembershipByEventAndUser,
  listTeamMembershipsByEventAndTeam,
  listTeamsByEvent,
} from '#/repositories/team-repository'

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

type CurrentTeamContribution = {
  userId: string
  userName: string
  score: number
  completedTileCount: number
  tileKeys: string[]
}

type CurrentStanding = {
  teamId: string
  teamName: string
  rank: number
  score: number
  gapToAbove: number | null
  gapToBelow: number | null
}

function toIsoString(value: string | Date | null) {
  if (!value) {
    return null
  }

  return value instanceof Date ? value.toISOString() : value
}

export type CurrentEventContext =
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
      contributions: CurrentTeamContribution[]
      standings: {
        currentTeamRank: number
        totalTeams: number
        gapToAbove: number | null
        gapToBelow: number | null
        otherTeams: CurrentStanding[]
      }
    }

function mergeTeamContributions({
  roster,
  contributions,
}: {
  roster: Awaited<ReturnType<typeof listTeamMembershipsByEventAndTeam>>
  contributions: ReturnType<typeof deriveUserContributions>
}): CurrentTeamContribution[] {
  const contributionByUserId = new Map(
    contributions.map((contribution) => [contribution.userId, contribution]),
  )

  return roster
    .map((member) => {
      const contribution = contributionByUserId.get(member.user_id)

      return {
        userId: member.user_id,
        userName: member.user_name,
        score: contribution?.score ?? 0,
        completedTileCount: contribution?.completedTileCount ?? 0,
        tileKeys: contribution?.tileKeys ?? [],
      }
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      if (right.completedTileCount !== left.completedTileCount) {
        return right.completedTileCount - left.completedTileCount
      }

      return left.userName.localeCompare(right.userName)
    })
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
    const teams = await listTeamsByEvent(event.id)
    const roster = await listTeamMembershipsByEventAndTeam(
      event.id,
      membership.team_id,
    )
    const eventCompletions = await listEventTileCompletions(event.id)
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

    const contributions = mergeTeamContributions({
      roster,
      contributions: deriveUserContributions(
        boardTiles.map((tile) => ({
          tile_key: tile.tile_key,
          adjacent_tile_keys: tile.adjacent_tile_keys,
          points: tile.points,
        })),
        completions.map((completion) => ({
          tile_key: completion.tile_key,
          completed_by_user_id: completion.completed_by_user_id,
        })),
      ),
    })

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
    const standings = deriveEventStandings(
      boardTiles.map((tile) => ({
        tile_key: tile.tile_key,
        adjacent_tile_keys: tile.adjacent_tile_keys,
        points: tile.points,
      })),
      teams.map((team) => ({
        teamId: team.id,
        teamName: team.name,
      })),
      eventCompletions.map((completion) => ({
        teamId: completion.team_id,
        tile_key: completion.tile_key,
        completed_by_user_id: completion.completed_by_user_id,
      })),
    )
    const currentStanding = standings.find(
      (standing) => standing.teamId === membership.team_id,
    )

    if (!currentStanding) {
      throw new Error(
        `Active event ${event.id} is missing standing data for team ${membership.team_id}`,
      )
    }

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
      standings: {
        currentTeamRank: currentStanding.rank,
        totalTeams: standings.length,
        gapToAbove: currentStanding.gapToAbove,
        gapToBelow: currentStanding.gapToBelow,
        otherTeams: standings.filter(
          (standing) => standing.teamId !== membership.team_id,
        ),
      },
    }
  },
)
