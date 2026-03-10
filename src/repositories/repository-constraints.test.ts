import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createEvent } from '#/repositories/event-repository'
import { findBoardByEventId, listBoardTiles } from '#/repositories/board-repository'
import {
  createTeamTileCompletion,
  deleteTeamTileCompletion,
  listTeamTileCompletions,
} from '#/repositories/completion-repository'
import {
  assignTeamMembership,
  createTeam,
  listTeamMembershipsByEvent,
} from '#/repositories/team-repository'
import { upsertUserFromKeycloak } from '#/repositories/user-repository'
import { cleanupTestData, createTestId } from '#/test/db-test-helpers'
import { deriveTeamScore, getBoardTileStateMap } from '#/domain/board-state'

describe('repository constraints', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('keeps one team membership per user per event by moving the membership', async () => {
    const suffix = createTestId()
    const event = await createEvent({
      name: `${suffix}-event`,
      status: 'draft',
      start_time: new Date().toISOString(),
      duration_minutes: 180,
      board_key: 'osrs-honeycomb',
    })
    const firstTeam = await createTeam({
      event_id: event.id,
      name: `${suffix}-alpha`,
    })
    const secondTeam = await createTeam({
      event_id: event.id,
      name: `${suffix}-beta`,
    })
    const user = await upsertUserFromKeycloak({
      keycloak_id: `${suffix}-user`,
      email: `${suffix}@example.com`,
      name: `${suffix}-user`,
      roles: ['USER'],
    })

    await assignTeamMembership({
      event_id: event.id,
      team_id: firstTeam.id,
      user_id: user.id,
    })
    await assignTeamMembership({
      event_id: event.id,
      team_id: secondTeam.id,
      user_id: user.id,
    })

    const memberships = await listTeamMembershipsByEvent(event.id)

    expect(memberships).toHaveLength(1)
    expect(memberships[0]?.team_id).toBe(secondTeam.id)
  })

  it('rejects duplicate completions for the same team and tile', async () => {
    const suffix = createTestId()
    const event = await createEvent({
      name: `${suffix}-event`,
      status: 'draft',
      start_time: new Date().toISOString(),
      duration_minutes: 180,
      board_key: 'osrs-honeycomb',
    })
    const team = await createTeam({
      event_id: event.id,
      name: `${suffix}-team`,
    })
    const user = await upsertUserFromKeycloak({
      keycloak_id: `${suffix}-user`,
      email: `${suffix}@example.com`,
      name: `${suffix}-user`,
      roles: ['USER'],
    })
    const board = await findBoardByEventId(event.id)

    if (!board) {
      throw new Error('Expected imported board to exist')
    }

    const boardTiles = await listBoardTiles(board.id)

    if (boardTiles.length === 0) {
      throw new Error('Expected board tile to exist')
    }

    const [tile] = boardTiles

    await createTeamTileCompletion({
        event_id: event.id,
        team_id: team.id,
        board_tile_id: tile.id,
        completed_by_user_id: user.id,
        proof_url: 'https://example.com/proof-1',
      })

    await expect(
      createTeamTileCompletion({
        event_id: event.id,
        team_id: team.id,
        board_tile_id: tile.id,
        completed_by_user_id: user.id,
        proof_url: 'https://example.com/proof-2',
      }),
    ).rejects.toThrow()
  })

  it('recomputes derived board state after a completion is invalidated', async () => {
    const suffix = createTestId()
    const event = await createEvent({
      name: `${suffix}-event`,
      status: 'draft',
      start_time: new Date().toISOString(),
      duration_minutes: 180,
      board_key: 'osrs-honeycomb',
    })
    const team = await createTeam({
      event_id: event.id,
      name: `${suffix}-team`,
    })
    const user = await upsertUserFromKeycloak({
      keycloak_id: `${suffix}-user`,
      email: `${suffix}@example.com`,
      name: `${suffix}-user`,
      roles: ['USER'],
    })
    const board = await findBoardByEventId(event.id)

    if (!board) {
      throw new Error('Expected imported board to exist')
    }

    const tiles = await listBoardTiles(board.id)
    const initialVisibleTileKeys =
      typeof board.layout_json === 'object' &&
      board.layout_json &&
      !Array.isArray(board.layout_json) &&
      Array.isArray(board.layout_json.initialVisibleTileKeys)
        ? board.layout_json.initialVisibleTileKeys.filter(
            (value): value is string => typeof value === 'string',
          )
        : []
    const initialTile = tiles.find((tile) =>
      initialVisibleTileKeys.includes(tile.tile_key),
    )

    if (!initialTile) {
      throw new Error('Expected an initial visible tile to exist')
    }

    const createdCompletion = await createTeamTileCompletion({
      event_id: event.id,
      team_id: team.id,
      board_tile_id: initialTile.id,
      completed_by_user_id: user.id,
      proof_url: 'https://example.com/proof',
    })

    const completionsWithRecord = await listTeamTileCompletions(event.id, team.id)
    const mappedWithRecord = completionsWithRecord.map((completion) => ({
      tile_key: completion.tile_key,
      completed_by_user_id: completion.completed_by_user_id,
    }))

    expect(deriveTeamScore(tiles, mappedWithRecord)).toBe(initialTile.points)
    expect(
      getBoardTileStateMap(tiles, mappedWithRecord, {
        initialVisibleTileKeys,
      })[initialTile.tile_key],
    ).toBe('completed')

    await deleteTeamTileCompletion(createdCompletion.id)

    const completionsWithoutRecord = await listTeamTileCompletions(
      event.id,
      team.id,
    )
    const mappedWithoutRecord = completionsWithoutRecord.map((completion) => ({
      tile_key: completion.tile_key,
      completed_by_user_id: completion.completed_by_user_id,
    }))

    expect(deriveTeamScore(tiles, mappedWithoutRecord)).toBe(0)
    expect(
      getBoardTileStateMap(tiles, mappedWithoutRecord, {
        initialVisibleTileKeys,
      })[initialTile.tile_key],
    ).toBe('unlocked')
  })
})
