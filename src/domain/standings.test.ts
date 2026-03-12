import { describe, expect, it } from 'vitest'
import { deriveEventStandings } from '#/domain/standings'

const tiles = [
  { tile_key: 'A', adjacent_tile_keys: ['B'], points: 1 },
  { tile_key: 'B', adjacent_tile_keys: ['A', 'C'], points: 2 },
  { tile_key: 'C', adjacent_tile_keys: ['B'], points: 4 },
]

describe('event standings derivation', () => {
  it('ranks teams by live completion score and includes zero-score teams', () => {
    expect(
      deriveEventStandings(
        tiles,
        [
          { teamId: 't1', teamName: 'Ash' },
          { teamId: 't2', teamName: 'Blaze' },
          { teamId: 't3', teamName: 'Cinder' },
        ],
        [
          { teamId: 't1', tile_key: 'B', completed_by_user_id: 'u1' },
          { teamId: 't2', tile_key: 'A', completed_by_user_id: 'u2' },
          { teamId: 't2', tile_key: 'C', completed_by_user_id: 'u2' },
        ],
      ),
    ).toEqual([
      {
        teamId: 't2',
        teamName: 'Blaze',
        score: 5,
        rank: 1,
        gapToAbove: null,
        gapToBelow: 3,
      },
      {
        teamId: 't1',
        teamName: 'Ash',
        score: 2,
        rank: 2,
        gapToAbove: 3,
        gapToBelow: 2,
      },
      {
        teamId: 't3',
        teamName: 'Cinder',
        score: 0,
        rank: 3,
        gapToAbove: 2,
        gapToBelow: null,
      },
    ])
  })

  it('assigns the same rank to tied scores and skips gap values to tied neighbors', () => {
    expect(
      deriveEventStandings(
        tiles,
        [
          { teamId: 't1', teamName: 'Ash' },
          { teamId: 't2', teamName: 'Blaze' },
          { teamId: 't3', teamName: 'Cinder' },
        ],
        [
          { teamId: 't1', tile_key: 'B', completed_by_user_id: 'u1' },
          { teamId: 't2', tile_key: 'B', completed_by_user_id: 'u2' },
        ],
      ),
    ).toEqual([
      {
        teamId: 't1',
        teamName: 'Ash',
        score: 2,
        rank: 1,
        gapToAbove: null,
        gapToBelow: 2,
      },
      {
        teamId: 't2',
        teamName: 'Blaze',
        score: 2,
        rank: 1,
        gapToAbove: null,
        gapToBelow: 2,
      },
      {
        teamId: 't3',
        teamName: 'Cinder',
        score: 0,
        rank: 2,
        gapToAbove: 2,
        gapToBelow: null,
      },
    ])
  })
})
