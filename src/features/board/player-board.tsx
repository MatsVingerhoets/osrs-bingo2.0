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
const TILE_HORIZONTAL_GAP_PX = 8
const TILE_VERTICAL_GAP_PX = 8
const ROW_HEIGHT_PX = TILE_SIZE_PX * 0.75 + TILE_VERTICAL_GAP_PX
const COLUMN_OFFSET_PX = TILE_SIZE_PX / 2 + TILE_HORIZONTAL_GAP_PX / 2
const ROW_STEP_PX = TILE_SIZE_PX + TILE_HORIZONTAL_GAP_PX
const HEX_TILE_CLIP_PATH =
  'polygon(0% 25%, 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%)'

function getTileImageUrl(tileKey: string) {
  return `/images/tiles/${tileKey.padStart(3, '0')}.webp`
}

function getTileFrameClass(colorTier: string, state: PlayerBoardTile['state']) {
  if (state === 'unlocked') {
    switch (colorTier) {
      case 'green':
        return 'bg-teal-300/28'
      case 'blue':
        return 'bg-sky-300/28'
      case 'red':
        return 'bg-rose-300/28'
      case 'purple':
        return 'bg-violet-300/28'
      case 'yellow':
        return 'bg-amber-300/32'
      case 'white':
      default:
        return 'bg-slate-200/24'
    }
  }

  switch (colorTier) {
    case 'green':
      return 'bg-teal-300/60'
    case 'blue':
      return 'bg-sky-300/60'
    case 'red':
      return 'bg-rose-300/60'
    case 'purple':
      return 'bg-violet-300/60'
    case 'yellow':
      return 'bg-amber-300/70'
    case 'white':
    default:
      return 'bg-slate-200/60'
  }
}

function getTileFillClass(colorTier: string, state: PlayerBoardTile['state']) {
  if (state === 'unlocked') {
    switch (colorTier) {
      case 'green':
        return 'bg-gradient-to-b from-teal-950 to-slate-950 hover:from-teal-900 hover:to-slate-900'
      case 'blue':
        return 'bg-gradient-to-b from-sky-950 to-slate-950 hover:from-sky-900 hover:to-slate-900'
      case 'red':
        return 'bg-gradient-to-b from-rose-950 to-slate-950 hover:from-rose-900 hover:to-slate-900'
      case 'purple':
        return 'bg-gradient-to-b from-violet-950 to-slate-950 hover:from-violet-900 hover:to-slate-900'
      case 'yellow':
        return 'bg-gradient-to-b from-amber-950 to-slate-950 hover:from-amber-900 hover:to-slate-900'
      case 'white':
      default:
        return 'bg-gradient-to-b from-slate-700 to-slate-950 hover:from-slate-600 hover:to-slate-900'
    }
  }

  switch (colorTier) {
    case 'green':
      return 'bg-gradient-to-b from-teal-700 to-teal-900'
    case 'blue':
      return 'bg-gradient-to-b from-sky-700 to-sky-900'
    case 'red':
      return 'bg-gradient-to-b from-rose-700 to-rose-900'
    case 'purple':
      return 'bg-gradient-to-b from-violet-700 to-violet-900'
    case 'yellow':
      return 'bg-gradient-to-b from-amber-600 to-amber-800'
    case 'white':
    default:
      return 'bg-gradient-to-b from-slate-300 to-slate-500'
  }
}

function CompletionMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="absolute inset-0 z-20 m-auto h-14 w-14 text-emerald-800"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.9 8.8L10.7 15l-3.6-3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getBoardWidth(layout: PlayerBoardLayout) {
  return Math.max(
    ...layout.rowCounts.map((rowCount, rowIndex) => {
      const rowWidth = TILE_SIZE_PX + (rowCount - 1) * ROW_STEP_PX

      return layout.rowShifts[rowIndex] * COLUMN_OFFSET_PX + rowWidth
    }),
  )
}

export function PlayerBoard({ layout, tiles, onSelectTile }: PlayerBoardProps) {
  const boardHeightPx =
    ROW_HEIGHT_PX * (layout.rowCounts.length - 1) + TILE_SIZE_PX
  const boardWidthPx = getBoardWidth(layout)

  return (
    <div className="overflow-x-auto rounded-[1.45rem] border border-slate-400/10 bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-3.5">
      <div className="flex min-w-fit justify-center">
        <div
          className="relative shrink-0"
          style={{
            width: `${Math.ceil(boardWidthPx)}px`,
            minWidth: `${Math.ceil(boardWidthPx)}px`,
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
                  gap: `${TILE_HORIZONTAL_GAP_PX}px`,
                }}
              >
                {rowTiles.slice(0, rowCount).map((tile) => {
                  const isHidden = tile.state === 'hidden'
                  const isCompleted = tile.state === 'completed'
                  const canSelect = tile.state !== 'hidden'

                  return (
                    <div
                      key={tile.id}
                      className={`relative h-22 w-22 shrink-0 ${getTileFrameClass(tile.colorTier, tile.state)}`}
                      style={{
                        clipPath: HEX_TILE_CLIP_PATH,
                        WebkitClipPath: HEX_TILE_CLIP_PATH,
                        opacity: isHidden ? 0.32 : 1,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (canSelect) {
                            onSelectTile(tile)
                          }
                        }}
                        disabled={!canSelect}
                        title={
                          isHidden ? `Hidden tile ${tile.tileKey}` : tile.label
                        }
                        className={`absolute inset-0 flex items-center justify-center transition ${
                          canSelect
                            ? 'cursor-pointer hover:brightness-95'
                            : 'cursor-default'
                        } ${getTileFillClass(tile.colorTier, tile.state)}`}
                        style={{
                          clipPath: HEX_TILE_CLIP_PATH,
                          WebkitClipPath: HEX_TILE_CLIP_PATH,
                          transform: 'scale(0.94)',
                          transformOrigin: 'center',
                        }}
                      >
                        {isCompleted ? <CompletionMark /> : null}

                        <span
                          className={
                            isCompleted
                              ? 'opacity-50'
                              : isHidden
                                ? 'opacity-0'
                                : ''
                          }
                        >
                          {!isHidden ? (
                            <img
                              src={getTileImageUrl(tile.tileKey)}
                              alt=""
                              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                            />
                          ) : null}
                        </span>

                        <span className="sr-only">
                          {isHidden
                            ? `Hidden tile ${tile.tileKey}`
                            : `${tile.tileKey} ${tile.label} ${tile.points} points`}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
