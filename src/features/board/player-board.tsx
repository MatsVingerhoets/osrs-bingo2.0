type PlayerBoardTile = {
  id: string
  tileKey: string
  label: string
  points: number
  colorTier: string
  rowIndex: number
  columnIndex: number
  state: 'hidden' | 'unlocked' | 'completed'
}

type PlayerBoardLayout = {
  rowCounts: number[]
  rowShifts: number[]
}

type PlayerBoardProps = {
  layout: PlayerBoardLayout
  tiles: PlayerBoardTile[]
  onSelectTile: (tile: PlayerBoardTile) => void
}

const TILE_SIZE_PX = 88
const TILE_HORIZONTAL_OVERLAP_PX = 8
const TILE_VERTICAL_GAP_PX = 4
const ROW_HEIGHT_PX = TILE_SIZE_PX * 0.75 + TILE_VERTICAL_GAP_PX
const COLUMN_OFFSET_PX = (TILE_SIZE_PX - TILE_HORIZONTAL_OVERLAP_PX) / 2

const tierToneByColor = {
  white:
    'border-[rgba(120,105,90,0.18)] bg-[linear-gradient(180deg,#ffffff,#f1ede6)] text-stone-800',
  green:
    'border-[rgba(82,111,54,0.2)] bg-[linear-gradient(180deg,#86efac,#4ade80)] text-[#18381f]',
  blue: 'border-[rgba(56,117,168,0.2)] bg-[linear-gradient(180deg,#93c5fd,#7dd3fc)] text-[#12324f]',
  red: 'border-[rgba(176,62,62,0.2)] bg-[linear-gradient(180deg,#fca5a5,#ef4444)] text-[#4d1313]',
  purple:
    'border-[rgba(117,74,170,0.2)] bg-[linear-gradient(180deg,#d8b4fe,#a855f7)] text-[#351355]',
  yellow:
    'border-[rgba(170,130,23,0.2)] bg-[linear-gradient(180deg,#fde68a,#eab308)] text-[#4b3507]',
} as const

const hexTileClipPath =
  'polygon(6.7% 25%, 50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%)'

export function PlayerBoard({ layout, tiles, onSelectTile }: PlayerBoardProps) {
  const boardHeightPx =
    ROW_HEIGHT_PX * (layout.rowCounts.length - 1) + TILE_SIZE_PX
  const maxRowWidthPx =
    Math.max(...layout.rowCounts.map((rowCount) => rowCount * TILE_SIZE_PX)) +
    (Math.max(...layout.rowShifts) + 1) * COLUMN_OFFSET_PX

  return (
    <div className="overflow-x-auto rounded-[1.7rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,250,244,0.98),rgba(245,236,223,0.94))] p-4 sm:p-5">
      <div
        className="relative"
        style={{
          minWidth: `${Math.ceil(maxRowWidthPx)}px`,
          height: `${Math.ceil(boardHeightPx)}px`,
        }}
      >
        {layout.rowCounts.map((rowCount, rowIndex) => {
          const rowTiles = tiles.filter((tile) => tile.rowIndex === rowIndex)

          return (
            <div
              key={rowIndex}
              className="absolute flex"
              style={{
                top: `${ROW_HEIGHT_PX * rowIndex}px`,
                left: `${layout.rowShifts[rowIndex] * COLUMN_OFFSET_PX}px`,
              }}
            >
              {rowTiles.slice(0, rowCount).map((tile, tileIndex) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => {
                    if (tile.state !== 'hidden') {
                      onSelectTile(tile)
                    }
                  }}
                  disabled={tile.state === 'hidden'}
                  className={`group relative flex h-[5.5rem] w-[5.5rem] shrink-0 flex-col items-center justify-center border px-2.5 text-center shadow-[0_1px_0_rgba(255,255,255,0.72)_inset,0_14px_28px_rgba(87,57,24,0.09)] transition-transform duration-150 ${tile.state === 'hidden'
                      ? 'cursor-default'
                      : 'cursor-pointer hover:-translate-y-0.5'
                    }`}
                  style={{
                    marginLeft:
                      tileIndex === 0 ? undefined : `-${TILE_HORIZONTAL_OVERLAP_PX}px`,
                    clipPath: hexTileClipPath,
                    WebkitClipPath: hexTileClipPath,
                    opacity:
                      tile.state === 'hidden'
                        ? 0.2
                        : tile.state === 'unlocked'
                          ? 0.95
                          : 1,
                  }}
                  title={
                    tile.state === 'hidden'
                      ? `Hidden tile ${tile.tileKey}`
                      : tile.label
                  }
                >
                  <div
                    className={`absolute inset-0 ${tierToneByColor[tile.colorTier as keyof typeof tierToneByColor]} ${tile.state === 'completed'
                        ? 'brightness-[0.96] saturate-[1.08]'
                        : tile.state === 'unlocked'
                          ? 'brightness-[1.02] saturate-[1.04]'
                          : 'grayscale-[0.25]'
                      }`}
                  />
                  <div className="absolute inset-[1px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_50%)]" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em]">
                      {tile.tileKey}
                    </span>
                    <span className="mt-2 line-clamp-3 text-[0.72rem] leading-4 font-semibold">
                      {tile.state === 'hidden' ? '??' : tile.label}
                    </span>
                    <span className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.14em]">
                      {tile.state === 'hidden' ? '' : `${tile.points} pts`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
