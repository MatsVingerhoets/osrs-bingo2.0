import type { Kysely, Transaction } from 'kysely'
import { getDb } from '#/lib/db/client'
import type { Database, NewBoard, NewBoardTile } from '#/models/db'

export type BoardExecutor = Kysely<Database> | Transaction<Database>

type CreateBoardInput = Pick<
  NewBoard,
  'event_id' | 'key' | 'name' | 'version' | 'layout_json'
>

type CreateBoardTileInput = Pick<
  NewBoardTile,
  | 'tile_key'
  | 'label'
  | 'info_url'
  | 'color_tier'
  | 'points'
  | 'adjacent_tile_keys'
  | 'row_index'
  | 'column_index'
>

export async function createBoardWithTilesInExecutor(
  executor: BoardExecutor,
  board: CreateBoardInput,
  tiles: CreateBoardTileInput[],
) {
  const timestamp = new Date().toISOString()

  const createdBoard = await executor
    .insertInto('boards')
    .values({
      ...board,
      created_at: timestamp,
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const createdTiles =
    tiles.length === 0
      ? []
      : await executor
          .insertInto('board_tiles')
          .values(
            tiles.map((tile) => ({
              ...tile,
              board_id: createdBoard.id,
              created_at: timestamp,
            })),
          )
          .returningAll()
          .execute()

  return {
    board: createdBoard,
    tiles: createdTiles,
  }
}

export async function createBoardWithTiles(
  board: CreateBoardInput,
  tiles: CreateBoardTileInput[],
) {
  return getDb()
    .transaction()
    .execute(async (trx) => {
      return createBoardWithTilesInExecutor(trx, board, tiles)
    })
}

export async function findBoardByEventId(eventId: string) {
  return getDb()
    .selectFrom('boards')
    .selectAll()
    .where('event_id', '=', eventId)
    .executeTakeFirst()
}

export async function listBoardTiles(boardId: string) {
  return getDb()
    .selectFrom('board_tiles')
    .selectAll()
    .where('board_id', '=', boardId)
    .orderBy('row_index')
    .orderBy('column_index')
    .execute()
}
