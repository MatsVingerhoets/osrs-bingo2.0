import { describe, expect, it } from 'vitest'
import {
  deriveTeamScore,
  deriveUserContributions,
  getBoardTileStateMap,
} from '#/domain/board-state'

const tiles = [
  { tile_key: 'A', adjacent_tile_keys: ['B'], points: 1 },
  { tile_key: 'B', adjacent_tile_keys: ['A', 'C'], points: 2 },
  { tile_key: 'C', adjacent_tile_keys: ['B'], points: 4 },
]

describe('board state derivation', () => {
  it('reveals adjacent tiles after a completion', () => {
    expect(
      getBoardTileStateMap(
        tiles,
        [{ tile_key: 'A', completed_by_user_id: 'u1' }],
        { initialVisibleTileKeys: ['A'] },
      ),
    ).toEqual({
      A: 'completed',
      B: 'unlocked',
      C: 'hidden',
    })
  })

  it('derives score and per-user contributions from unique completions', () => {
    const completions = [
      { tile_key: 'A', completed_by_user_id: 'u1' },
      { tile_key: 'B', completed_by_user_id: 'u2' },
      { tile_key: 'A', completed_by_user_id: 'u3' },
    ]

    expect(deriveTeamScore(tiles, completions)).toBe(3)
    expect(deriveUserContributions(tiles, completions)).toEqual([
      {
        userId: 'u2',
        score: 2,
        completedTileCount: 1,
        tileKeys: ['B'],
      },
      {
        userId: 'u1',
        score: 1,
        completedTileCount: 1,
        tileKeys: ['A'],
      },
    ])
  })

  it('recomputes visibility and score after invalidation removes a completion', () => {
    const withCompletion = [{ tile_key: 'A', completed_by_user_id: 'u1' }]
    const withoutCompletion: typeof withCompletion = []

    expect(deriveTeamScore(tiles, withCompletion)).toBe(1)
    expect(
      getBoardTileStateMap(tiles, withCompletion, {
        initialVisibleTileKeys: ['A'],
      }),
    ).toEqual({
      A: 'completed',
      B: 'unlocked',
      C: 'hidden',
    })

    expect(deriveTeamScore(tiles, withoutCompletion)).toBe(0)
    expect(
      getBoardTileStateMap(tiles, withoutCompletion, {
        initialVisibleTileKeys: ['A'],
      }),
    ).toEqual({
      A: 'unlocked',
      B: 'hidden',
      C: 'hidden',
    })
  })
})
