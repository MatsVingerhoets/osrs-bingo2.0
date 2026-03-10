import { createServerFn } from '@tanstack/react-start'
import { getBoardTileStateMap } from '#/domain/board-state'
import { canSubmitTeamCompletion } from '#/domain/event-state'
import { getAppSession } from '#/lib/session/app-session'
import {
  createTeamTileCompletion,
  listTeamTileCompletions,
} from '#/repositories/completion-repository'
import {
  findBoardByEventId,
  listBoardTiles,
} from '#/repositories/board-repository'
import { findEventByStatus } from '#/repositories/event-repository'
import { findTeamMembershipByEventAndUser } from '#/repositories/team-repository'

type SubmitTeamCompletionInput = {
  tileKey: string
  proofUrl: string
}

function assertProofUrl(proofUrl: string) {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(proofUrl)
  } catch {
    throw new Error('Proof URL must be a valid absolute URL')
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('Proof URL must use http or https')
  }

  return parsedUrl.toString()
}

export const submitTeamCompletion = createServerFn({ method: 'POST' })
  .inputValidator((input: SubmitTeamCompletionInput) => input)
  .handler(async ({ data }) => {
    const session = await getAppSession()
    const userId = session.data.userId

    if (!userId) {
      throw new Error('You must be signed in to submit a completion')
    }

    const tileKey = data.tileKey.trim()
    const proofUrl = assertProofUrl(data.proofUrl.trim())
    const event = await findEventByStatus('active')

    if (!event) {
      throw new Error('There is no active event')
    }

    if (!canSubmitTeamCompletion(event.status)) {
      throw new Error('Tile submissions are closed for this event')
    }

    const membership = await findTeamMembershipByEventAndUser(event.id, userId)

    if (!membership) {
      throw new Error('You are not assigned to a team for the active event')
    }

    const board = await findBoardByEventId(event.id)

    if (!board) {
      throw new Error('The active event board could not be found')
    }

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
      {
        initialVisibleTileKeys:
          typeof board.layout_json === 'object' &&
          board.layout_json &&
          !Array.isArray(board.layout_json) &&
          Array.isArray(board.layout_json.initialVisibleTileKeys) &&
          board.layout_json.initialVisibleTileKeys.every(
            (value) => typeof value === 'string',
          )
            ? board.layout_json.initialVisibleTileKeys
            : [],
      },
    )

    const tile = boardTiles.find((boardTile) => boardTile.tile_key === tileKey)

    if (!tile) {
      throw new Error('That tile does not exist on the current board')
    }

    if (tileStateMap[tile.tile_key] !== 'unlocked') {
      throw new Error('Only unlocked tiles can be submitted')
    }

    const completion = await createTeamTileCompletion({
      event_id: event.id,
      team_id: membership.team_id,
      board_tile_id: tile.id,
      completed_by_user_id: userId,
      proof_url: proofUrl,
    })

    return {
      id: completion.id,
      tileKey,
    }
  })
