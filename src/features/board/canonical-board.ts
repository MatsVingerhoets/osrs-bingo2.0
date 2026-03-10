import type { JsonValue } from '#/models/db'
import { legacyCanonicalTiles } from '#/features/board/legacy-canonical-tiles'

export const CANONICAL_BOARD_KEY = 'osrs-honeycomb'
export const CANONICAL_BOARD_VERSION = 'legacy-main-2026-03-10'
export const CANONICAL_BOARD_SOURCE_URL =
  'https://github.com/MatsVingerhoets/osrs-bingo/blob/main/src/data/tiles.ts'

const ROW_COUNTS = [6, 7, 8, 9, 10, 11, 12, 11, 10, 9, 8, 7] as const
const ROW_SHIFTS = [6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5] as const
const INITIAL_VISIBLE_TILE_KEYS = ['46', '57', '58'] as const

const COLOR_TIER_BY_LEGACY_COLOR = {
  'bg-white': 'white',
  'bg-green-400': 'green',
  'bg-blue-300': 'blue',
  'bg-red-500': 'red',
  'bg-purple-500': 'purple',
  'bg-yellow-500': 'yellow',
} as const

const POINTS_BY_COLOR_TIER = {
  white: 1,
  green: 2,
  blue: 4,
  red: 8,
  purple: 16,
  yellow: 32,
} as const

export type BoardColorTier = keyof typeof POINTS_BY_COLOR_TIER

export type CanonicalBoardTile = {
  source_id: number
  tile_key: string
  label: string
  info_url: string
  color_tier: BoardColorTier
  points: number
  adjacent_tile_keys: string[]
  row_index: number
  column_index: number
}

export type CanonicalBoardLayoutMetadata = {
  sourceUrl: string
  rowCounts: number[]
  rowShifts: number[]
  initialVisibleTileKeys: string[]
  totalTiles: number
}

export type CanonicalBoardDefinition = {
  key: typeof CANONICAL_BOARD_KEY
  name: string
  version: string
  layout_json: JsonValue
  tiles: CanonicalBoardTile[]
}

function failValidation(message: string): never {
  throw new Error(`Canonical board validation failed: ${message}`)
}

function getColorTier(legacyColor: string, tileId: number): BoardColorTier {
  if (!(legacyColor in COLOR_TIER_BY_LEGACY_COLOR)) {
    failValidation(`unsupported color ${legacyColor} for tile ${tileId}`)
  }

  return COLOR_TIER_BY_LEGACY_COLOR[
    legacyColor as keyof typeof COLOR_TIER_BY_LEGACY_COLOR
  ]
}

function validateCanonicalBoard() {
  const totalTileCount = ROW_COUNTS.reduce((sum, count) => sum + count, 0)

  if (legacyCanonicalTiles.length !== totalTileCount) {
    failValidation(
      `expected ${totalTileCount} tiles, received ${legacyCanonicalTiles.length}`,
    )
  }

  const seenTileKeys = new Set<string>()

  for (const tile of legacyCanonicalTiles) {
    const tileKey = String(tile.id)
    const colorTier = getColorTier(tile.color, tile.id)

    if (!Number.isInteger(tile.id) || tile.id <= 0) {
      failValidation(`tile id must be a positive integer, received ${tile.id}`)
    }

    if (seenTileKeys.has(tileKey)) {
      failValidation(`duplicate tile id ${tile.id}`)
    }

    if (POINTS_BY_COLOR_TIER[colorTier] !== tile.points) {
      failValidation(
        `tile ${tile.id} expected ${POINTS_BY_COLOR_TIER[colorTier]} points for ${colorTier}, received ${tile.points}`,
      )
    }

    seenTileKeys.add(tileKey)
  }

  for (const initialVisibleTileKey of INITIAL_VISIBLE_TILE_KEYS) {
    if (!seenTileKeys.has(initialVisibleTileKey)) {
      failValidation(`missing initial visible tile ${initialVisibleTileKey}`)
    }
  }

  for (const tile of legacyCanonicalTiles) {
    for (const adjacentTileId of tile.adjacentTiles) {
      if (!seenTileKeys.has(String(adjacentTileId))) {
        failValidation(
          `tile ${tile.id} references missing adjacent tile ${adjacentTileId}`,
        )
      }
    }
  }
}

validateCanonicalBoard()

const canonicalBoardTiles: CanonicalBoardTile[] = (() => {
  let tileIndex = 0

  return ROW_COUNTS.flatMap((rowTileCount, rowIndex) =>
    Array.from({ length: rowTileCount }, (_, columnIndex) => {
      const tile = legacyCanonicalTiles[tileIndex]
      const colorTier = getColorTier(tile.color, tile.id)

      tileIndex += 1

      return {
        source_id: tile.id,
        tile_key: String(tile.id),
        label: tile.label,
        info_url: tile.url,
        color_tier: colorTier,
        points: tile.points,
        adjacent_tile_keys: tile.adjacentTiles.map(String),
        row_index: rowIndex,
        column_index: columnIndex,
      }
    }),
  )
})()

export const canonicalBoardLayoutMetadata: CanonicalBoardLayoutMetadata = {
  sourceUrl: CANONICAL_BOARD_SOURCE_URL,
  rowCounts: [...ROW_COUNTS],
  rowShifts: [...ROW_SHIFTS],
  initialVisibleTileKeys: [...INITIAL_VISIBLE_TILE_KEYS],
  totalTiles: canonicalBoardTiles.length,
}

export const canonicalBoardDefinition: CanonicalBoardDefinition = {
  key: CANONICAL_BOARD_KEY,
  name: 'OSRS Honeycomb',
  version: CANONICAL_BOARD_VERSION,
  layout_json: canonicalBoardLayoutMetadata,
  tiles: canonicalBoardTiles,
}

export function getCanonicalBoardDefinition(boardKey: string) {
  if (boardKey !== CANONICAL_BOARD_KEY) {
    throw new Error(`Unsupported board key: ${boardKey}`)
  }

  return canonicalBoardDefinition
}
