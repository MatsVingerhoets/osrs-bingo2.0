import { getCanonicalBoardDefinition } from '#/features/board/canonical-board'
import { createBoardWithTilesInExecutor } from '#/repositories/board-repository'
import type { BoardExecutor } from '#/repositories/board-repository'

export async function importBoardForEvent(
  executor: BoardExecutor,
  eventId: string,
  boardKey: string,
) {
  const definition = getCanonicalBoardDefinition(boardKey)

  return createBoardWithTilesInExecutor(
    executor,
    {
      event_id: eventId,
      key: definition.key,
      name: definition.name,
      version: definition.version,
      layout_json: definition.layout_json,
    },
    definition.tiles.map((tile) => ({
      tile_key: tile.tile_key,
      label: tile.label,
      info_url: tile.info_url,
      color_tier: tile.color_tier,
      points: tile.points,
      adjacent_tile_keys: tile.adjacent_tile_keys,
      row_index: tile.row_index,
      column_index: tile.column_index,
    })),
  )
}
