import { useEffect, useState } from 'react'

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

type BoardSizing = {
  tileSizePx: number
  tileHorizontalGapPx: number
  tileVerticalGapPx: number
  iconSizePx: number
  completionMarkSizePx: number
  completionIconSizePx: number
}

type ViewportMetrics = {
  viewportWidth: number
  scaledScreenWidth: number
}

const LARGE_BOARD_SIZING: BoardSizing = {
  tileSizePx: 80,
  tileHorizontalGapPx: 6,
  tileVerticalGapPx: 6,
  iconSizePx: 33,
  completionMarkSizePx: 45,
  completionIconSizePx: 28,
}

const MEDIUM_BOARD_SIZING: BoardSizing = {
  tileSizePx: 72,
  tileHorizontalGapPx: 5,
  tileVerticalGapPx: 5,
  iconSizePx: 30,
  completionMarkSizePx: 40,
  completionIconSizePx: 26,
}

const COMPACT_BOARD_SIZING: BoardSizing = {
  tileSizePx: 66,
  tileHorizontalGapPx: 4,
  tileVerticalGapPx: 4,
  iconSizePx: 28,
  completionMarkSizePx: 36,
  completionIconSizePx: 24,
}

const HEX_TILE_CLIP_PATH =
  'polygon(0% 25%, 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%)'

function getBoardSizing(metrics: ViewportMetrics | null): BoardSizing {
  if (metrics !== null) {
    if (
      metrics.scaledScreenWidth >= 3000 ||
      metrics.viewportWidth >= 3000
    ) {
      return LARGE_BOARD_SIZING
    }

    if (metrics.viewportWidth >= 2200) {
      return MEDIUM_BOARD_SIZING
    }
  }

  return COMPACT_BOARD_SIZING
}

function getRowHeightPx(sizing: BoardSizing) {
  return sizing.tileSizePx * 0.75 + sizing.tileVerticalGapPx
}

function getColumnOffsetPx(sizing: BoardSizing) {
  return sizing.tileSizePx / 2 + sizing.tileHorizontalGapPx / 2
}

function getRowStepPx(sizing: BoardSizing) {
  return sizing.tileSizePx + sizing.tileHorizontalGapPx
}

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

function CompletionMark({ sizing }: { sizing: BoardSizing }) {
  return (
    <div
      className="absolute inset-0 z-20 m-auto flex items-center justify-center rounded-full bg-slate-950/82 shadow-[0_8px_18px_rgba(2,6,23,0.45)] backdrop-blur-sm"
      style={{
        width: `${sizing.completionMarkSizePx}px`,
        height: `${sizing.completionMarkSizePx}px`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="text-emerald-300"
        style={{
          width: `${sizing.completionIconSizePx}px`,
          height: `${sizing.completionIconSizePx}px`,
        }}
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
    </div>
  )
}

function getBoardWidth(layout: PlayerBoardLayout, sizing: BoardSizing) {
  const rowStepPx = getRowStepPx(sizing)
  const columnOffsetPx = getColumnOffsetPx(sizing)

  return Math.max(
    ...layout.rowCounts.map((rowCount, rowIndex) => {
      const rowWidth = sizing.tileSizePx + (rowCount - 1) * rowStepPx

      return layout.rowShifts[rowIndex] * columnOffsetPx + rowWidth
    }),
  )
}

export function PlayerBoard({ layout, tiles, onSelectTile }: PlayerBoardProps) {
  const [viewportMetrics, setViewportMetrics] = useState<ViewportMetrics | null>(null)

  useEffect(() => {
    function updateViewportMetrics() {
      setViewportMetrics({
        viewportWidth: window.innerWidth,
        scaledScreenWidth: window.screen.width * window.devicePixelRatio,
      })
    }

    updateViewportMetrics()
    window.addEventListener('resize', updateViewportMetrics)

    return () => {
      window.removeEventListener('resize', updateViewportMetrics)
    }
  }, [])

  const sizing = getBoardSizing(viewportMetrics)
  const rowHeightPx = getRowHeightPx(sizing)
  const columnOffsetPx = getColumnOffsetPx(sizing)
  const boardHeightPx =
    rowHeightPx * (layout.rowCounts.length - 1) + sizing.tileSizePx
  const boardWidthPx = getBoardWidth(layout, sizing)

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
                  top: `${rowHeightPx * rowIndex}px`,
                  left: `${layout.rowShifts[rowIndex] * columnOffsetPx}px`,
                  gap: `${sizing.tileHorizontalGapPx}px`,
                }}
              >
                {rowTiles.slice(0, rowCount).map((tile) => {
                  const isHidden = tile.state === 'hidden'
                  const isCompleted = tile.state === 'completed'
                  const canSelect = tile.state !== 'hidden'

                  return (
                    <div
                      key={tile.id}
                      className={`relative shrink-0 ${getTileFrameClass(tile.colorTier, tile.state)}`}
                      style={{
                        width: `${sizing.tileSizePx}px`,
                        height: `${sizing.tileSizePx}px`,
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
                        {isCompleted ? <CompletionMark sizing={sizing} /> : null}

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
                              className="object-contain"
                              style={{
                                width: `${sizing.iconSizePx}px`,
                                height: `${sizing.iconSizePx}px`,
                              }}
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
