export type BoardTileDefinition = {
  tile_key: string
  adjacent_tile_keys: string[]
  points: number
}

export type BoardLayoutDefinition = {
  initialVisibleTileKeys: string[]
}

export type TeamTileCompletionRecord = {
  tile_key: string
  completed_by_user_id: string
}

export type BoardTileState = 'hidden' | 'unlocked' | 'completed'

export type UserContribution = {
  userId: string
  score: number
  completedTileCount: number
  tileKeys: string[]
}

function getUniqueCompletedTileMap(completions: TeamTileCompletionRecord[]) {
  const uniqueCompletedTiles = new Map<string, TeamTileCompletionRecord>()

  for (const completion of completions) {
    if (!uniqueCompletedTiles.has(completion.tile_key)) {
      uniqueCompletedTiles.set(completion.tile_key, completion)
    }
  }

  return uniqueCompletedTiles
}

function getTilePointsByKey(tiles: BoardTileDefinition[]) {
  return new Map(tiles.map((tile) => [tile.tile_key, tile.points]))
}

export function getInitialVisibleTiles(layout: BoardLayoutDefinition) {
  return [...new Set(layout.initialVisibleTileKeys)]
}

export function getVisibleTileKeys(
  tiles: BoardTileDefinition[],
  completions: TeamTileCompletionRecord[],
  layout: BoardLayoutDefinition,
) {
  const visibleTileKeys = new Set(getInitialVisibleTiles(layout))
  const completedTiles = getUniqueCompletedTileMap(completions)
  const tilesByKey = new Map(tiles.map((tile) => [tile.tile_key, tile]))

  for (const [tileKey] of completedTiles) {
    visibleTileKeys.add(tileKey)

    const tile = tilesByKey.get(tileKey)

    for (const adjacentTileKey of tile?.adjacent_tile_keys ?? []) {
      visibleTileKeys.add(adjacentTileKey)
    }
  }

  return tiles
    .map((tile) => tile.tile_key)
    .filter((tileKey) => visibleTileKeys.has(tileKey))
}

export function getBoardTileStateMap(
  tiles: BoardTileDefinition[],
  completions: TeamTileCompletionRecord[],
  layout: BoardLayoutDefinition,
) {
  const completedTileKeys = new Set(
    getUniqueCompletedTileMap(completions).keys(),
  )
  const visibleTileKeys = new Set(
    getVisibleTileKeys(tiles, completions, layout),
  )

  return Object.fromEntries(
    tiles.map((tile) => {
      const state: BoardTileState = completedTileKeys.has(tile.tile_key)
        ? 'completed'
        : visibleTileKeys.has(tile.tile_key)
          ? 'unlocked'
          : 'hidden'

      return [tile.tile_key, state]
    }),
  ) as Record<string, BoardTileState>
}

export function deriveTeamScore(
  tiles: BoardTileDefinition[],
  completions: TeamTileCompletionRecord[],
) {
  const completedTiles = getUniqueCompletedTileMap(completions)
  const tilePointsByKey = getTilePointsByKey(tiles)
  let score = 0

  for (const tileKey of completedTiles.keys()) {
    score += tilePointsByKey.get(tileKey) ?? 0
  }

  return score
}

export function deriveUserContributions(
  tiles: BoardTileDefinition[],
  completions: TeamTileCompletionRecord[],
) {
  const completedTiles = getUniqueCompletedTileMap(completions)
  const tilePointsByKey = getTilePointsByKey(tiles)
  const contributionsByUserId = new Map<string, UserContribution>()

  for (const completion of completedTiles.values()) {
    const existingContribution = contributionsByUserId.get(
      completion.completed_by_user_id,
    ) ?? {
      userId: completion.completed_by_user_id,
      score: 0,
      completedTileCount: 0,
      tileKeys: [],
    }

    existingContribution.score += tilePointsByKey.get(completion.tile_key) ?? 0
    existingContribution.completedTileCount += 1
    existingContribution.tileKeys.push(completion.tile_key)

    contributionsByUserId.set(
      completion.completed_by_user_id,
      existingContribution,
    )
  }

  return [...contributionsByUserId.values()].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score
    }

    return left.userId.localeCompare(right.userId)
  })
}
