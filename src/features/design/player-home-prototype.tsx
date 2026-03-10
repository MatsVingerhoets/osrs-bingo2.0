import { useEffect, useState } from 'react'
import {
  canonicalBoardDefinition,
  canonicalBoardLayoutMetadata,
} from '#/features/board/canonical-board'
import { getBoardTileStateMap } from '#/domain/board-state'
import {
  BoardShell,
  RightRail,
  TopNav,
} from '#/features/design/player-home-prototype-sections'

const prototypeCompletions = [
  { tile_key: '46', completed_by_user_id: 'lynx' },
  { tile_key: '57', completed_by_user_id: 'mira' },
  { tile_key: '58', completed_by_user_id: 'dax' },
] as const

const teamLeaderboard = [
  { name: 'Lynx', points: 64 },
  { name: 'Mira', points: 48 },
  { name: 'Dax', points: 39 },
  { name: 'Sol', points: 33 },
] as const

const otherTeams = [
  { name: 'Ember', points: 201 },
  { name: 'Moss', points: 177 },
  { name: 'Slate', points: 143 },
] as const

const PROTOTYPE_TILE_SIZE_PX = 88
const PROTOTYPE_TILE_HORIZONTAL_GAP_PX = 8
const PROTOTYPE_TILE_VERTICAL_GAP_PX = 8
const PROTOTYPE_ROW_HEIGHT_PX =
  PROTOTYPE_TILE_SIZE_PX * 0.75 + PROTOTYPE_TILE_VERTICAL_GAP_PX
const PROTOTYPE_COLUMN_OFFSET_PX =
  PROTOTYPE_TILE_SIZE_PX / 2 + PROTOTYPE_TILE_HORIZONTAL_GAP_PX / 2
const PROTOTYPE_ROW_STEP_PX =
  PROTOTYPE_TILE_SIZE_PX + PROTOTYPE_TILE_HORIZONTAL_GAP_PX
const PROTOTYPE_HEX_CLIP_PATH =
  'polygon(0% 25%, 50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%)'

const prototypeTileStateMap = getBoardTileStateMap(
  canonicalBoardDefinition.tiles.map((tile) => ({
    tile_key: tile.tile_key,
    adjacent_tile_keys: tile.adjacent_tile_keys,
    points: tile.points,
  })),
  [...prototypeCompletions],
  { initialVisibleTileKeys: canonicalBoardLayoutMetadata.initialVisibleTileKeys },
)

const prototypeBoardRows = canonicalBoardLayoutMetadata.rowCounts.map(
  (_rowCount, rowIndex) =>
    canonicalBoardDefinition.tiles.filter((tile) => tile.row_index === rowIndex),
)

const prototypeCompletedCount = Object.values(prototypeTileStateMap).filter(
  (state) => state === 'completed',
).length

const prototypeUnlockedCount = Object.values(prototypeTileStateMap).filter(
  (state) => state === 'unlocked',
).length

const PROTOTYPE_BOARD_HEIGHT_PX =
  PROTOTYPE_ROW_HEIGHT_PX * (canonicalBoardLayoutMetadata.rowCounts.length - 1) +
  PROTOTYPE_TILE_SIZE_PX

const PROTOTYPE_BOARD_WIDTH_PX =
  Math.max(
    ...canonicalBoardLayoutMetadata.rowCounts.map((rowCount, rowIndex) => {
      const rowWidth =
        PROTOTYPE_TILE_SIZE_PX +
        (rowCount - 1) * PROTOTYPE_ROW_STEP_PX

      return (
        canonicalBoardLayoutMetadata.rowShifts[rowIndex] *
        PROTOTYPE_COLUMN_OFFSET_PX +
        rowWidth
      )
    }),
  )

type DesktopMetrics = {
  boardScale: number
  dashboardMaxWidth: number
  sidebarWidth: number
  layoutGap: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getTileImageUrl(tileKey: string) {
  return `/images/tiles/${tileKey.padStart(3, '0')}.webp`
}

function getBaseTileClass(colorTier: string) {
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

function getTileFillClass(colorTier: string) {
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
      className="absolute inset-0 z-20 m-auto h-14 w-14 text-green-800"
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

function getTileContentClass(state: (typeof prototypeTileStateMap)[string]) {
  if (state === 'completed') {
    return 'opacity-50'
  }

  if (state === 'hidden') {
    return 'opacity-0'
  }

  return ''
}

function getTileInteractionClass(state: (typeof prototypeTileStateMap)[string]) {
  if (state === 'hidden') {
    return 'cursor-default'
  }

  return 'cursor-pointer'
}

function getTileToneClass(state: (typeof prototypeTileStateMap)[string]) {
  if (state === 'completed') {
    return ''
  }

  if (state === 'unlocked') {
    return 'hover:brightness-95'
  }

  return ''
}

function getDesktopMetrics(
  viewportWidth: number,
  viewportHeight: number,
): DesktopMetrics {
  const dashboardMaxWidth = clamp(viewportWidth - 24, 1280, 2800)
  const sidebarWidth = clamp(viewportWidth * 0.205, 320, 448)
  const layoutGap = clamp(viewportWidth * 0.011, 16, 28)
  const pageHorizontalPadding = viewportWidth >= 1280 ? 24 : 20
  const pageVerticalChrome = viewportWidth >= 1280 ? 32 : 24
  const navChrome = viewportWidth >= 1280 ? 76 : 88
  const boardShellHorizontalChrome = viewportWidth >= 1536 ? 34 : 30
  const boardShellVerticalChrome = viewportWidth >= 1536 ? 118 : 110
  const viewportSafetyBuffer = viewportHeight >= 1440 ? 24 : 36

  const contentWidth = dashboardMaxWidth - pageHorizontalPadding * 2
  const boardColumnWidth = contentWidth - sidebarWidth - layoutGap
  const availableBoardWidth = boardColumnWidth - boardShellHorizontalChrome
  const availableBoardHeight =
    viewportHeight -
    pageVerticalChrome -
    navChrome -
    boardShellVerticalChrome -
    viewportSafetyBuffer

  const boardScale = clamp(
    Math.min(
      availableBoardWidth / PROTOTYPE_BOARD_WIDTH_PX,
      availableBoardHeight / PROTOTYPE_BOARD_HEIGHT_PX,
    ),
    0.82,
    1.42,
  )

  return {
    boardScale,
    dashboardMaxWidth,
    sidebarWidth,
    layoutGap,
  }
}

function useDesktopMetrics() {
  const [desktopMetrics, setDesktopMetrics] = useState<DesktopMetrics>({
    boardScale: 1,
    dashboardMaxWidth: 1280,
    sidebarWidth: 352,
    layoutGap: 24,
  })

  useEffect(() => {
    function updateMetrics() {
      setDesktopMetrics(getDesktopMetrics(window.innerWidth, window.innerHeight))
    }

    updateMetrics()
    window.addEventListener('resize', updateMetrics)

    return () => {
      window.removeEventListener('resize', updateMetrics)
    }
  }, [])

  return desktopMetrics
}

function HexTile({
  tile,
}: {
  tile: (typeof canonicalBoardDefinition.tiles)[number]
}) {
  const state = prototypeTileStateMap[tile.tile_key]
  const isHidden = state === 'hidden'
  const outerClass =
    state === 'completed'
      ? getBaseTileClass(tile.color_tier)
      : state === 'unlocked'
        ? 'bg-slate-300/30'
        : getBaseTileClass(tile.color_tier)
  const innerClass =
    state === 'completed'
      ? `${getTileFillClass(tile.color_tier)}`
      : state === 'unlocked'
        ? 'bg-gradient-to-b from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900'
        : getTileFillClass(tile.color_tier)

  return (
    <div
      className={`relative h-22 w-22 shrink-0 ${outerClass}`}
      style={{
        clipPath: PROTOTYPE_HEX_CLIP_PATH,
        WebkitClipPath: PROTOTYPE_HEX_CLIP_PATH,
        opacity: isHidden ? 0.34 : 1,
      }}
    >
      <button
        type="button"
        className={`absolute inset-0 flex items-center justify-center ${innerClass} ${getTileInteractionClass(state)} ${getTileToneClass(state)}`}
        style={{
          clipPath: PROTOTYPE_HEX_CLIP_PATH,
          WebkitClipPath: PROTOTYPE_HEX_CLIP_PATH,
          transform: 'scale(0.94)',
          transformOrigin: 'center',
        }}
      >
        {state === 'completed' ? <CompletionMark /> : null}
        <span
          className={`flex items-center justify-center ${getTileContentClass(state)}`}
        >
          {!isHidden ? (
            <img
              src={getTileImageUrl(tile.tile_key)}
              alt=""
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
          ) : null}
        </span>
      </button>
    </div>
  )
}

function PrototypeBoard({ scale }: { scale: number }) {
  const scaledBoardWidth = Math.ceil(PROTOTYPE_BOARD_WIDTH_PX * scale)
  const scaledBoardHeight = Math.ceil(PROTOTYPE_BOARD_HEIGHT_PX * scale)

  return (
    <div className="overflow-x-auto rounded-[1.45rem] border border-slate-400/10 bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-3.5">
      <div className="flex justify-center">
        <div
          className="relative shrink-0"
          style={{
            width: `${scaledBoardWidth}px`,
            minWidth: `${scaledBoardWidth}px`,
            height: `${scaledBoardHeight}px`,
          }}
        >
          <div
            className="origin-top-left"
            style={{
              width: `${Math.ceil(PROTOTYPE_BOARD_WIDTH_PX)}px`,
              height: `${Math.ceil(PROTOTYPE_BOARD_HEIGHT_PX)}px`,
              transform: `scale(${scale})`,
            }}
          >
            {prototypeBoardRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="absolute flex"
                style={{
                  top: `${PROTOTYPE_ROW_HEIGHT_PX * rowIndex}px`,
                  left: `${canonicalBoardLayoutMetadata.rowShifts[rowIndex] * PROTOTYPE_COLUMN_OFFSET_PX}px`,
                  gap: `${PROTOTYPE_TILE_HORIZONTAL_GAP_PX}px`,
                }}
              >
                {row.map((tile) => (
                  <HexTile key={tile.tile_key} tile={tile} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlayerHomePrototype() {
  const desktopMetrics = useDesktopMetrics()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_20%),radial-gradient(circle_at_right,rgba(59,130,246,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-2.5 text-white sm:px-5 sm:py-3 lg:px-6 lg:py-4">
      <div
        className="mx-auto"
        style={{ maxWidth: `${Math.round(desktopMetrics.dashboardMaxWidth)}px` }}
      >
        <TopNav />

        <div
          className="grid items-start"
          style={{
            gap: `${Math.round(desktopMetrics.layoutGap)}px`,
            gridTemplateColumns: `minmax(0, 1fr) ${Math.round(desktopMetrics.sidebarWidth)}px`,
          }}
        >
          <BoardShell
            completedCount={prototypeCompletedCount}
            unlockedCount={prototypeUnlockedCount}
          >
            <PrototypeBoard scale={desktopMetrics.boardScale} />
          </BoardShell>
          <RightRail
            teamLeaderboard={teamLeaderboard}
            otherTeams={otherTeams}
          />
        </div>
      </div>
    </main>
  )
}
