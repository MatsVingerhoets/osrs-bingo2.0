import { useState } from 'react'

type BoardTileState = 'hidden' | 'unlocked' | 'completed'

type TilePanelTile = {
  id: string
  tileKey: string
  label: string
  points: number
  state: BoardTileState
}

type TileCompletion = {
  id: string
  tileKey: string
  tileLabel: string
  tilePoints: number
  completedAt: string
  completedByUserId: string
  completedByName: string
  proofUrl: string
}

type TilePanelProps = {
  tile: TilePanelTile
  completion?: TileCompletion
  canSubmit: boolean
  isSubmitting: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (proofUrl: string) => Promise<void>
}

function getStateLabel(state: BoardTileState) {
  switch (state) {
    case 'completed':
      return 'Completed'
    case 'unlocked':
      return 'Unlocked'
    case 'hidden':
    default:
      return 'Hidden'
  }
}

export function TilePanel({
  tile,
  completion,
  canSubmit,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: TilePanelProps) {
  const [proofUrl, setProofUrl] = useState('')

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(2,6,23,0.72)] p-4 backdrop-blur-[8px] sm:items-center">
      <div className="w-full max-w-xl rounded-[1.9rem] border border-slate-400/15 bg-gradient-to-b from-slate-900/95 to-slate-950 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.5)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-cyan-300">
                Tile {tile.tileKey}
              </p>
              <span className="rounded-full border border-slate-400/15 bg-slate-800/90 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
                {getStateLabel(tile.state)}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {tile.label}
            </h3>
            <p className="mt-2 text-sm text-slate-400">{tile.points} points</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-400/15 bg-slate-900/70 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        {tile.state === 'completed' && completion ? (
          <div className="mt-6 space-y-4 rounded-[1.6rem] border border-emerald-300/15 bg-emerald-400/8 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-emerald-200">
                  Verified Completion
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  Completed by {completion.completedByName}
                </p>
              </div>
              <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {completion.tilePoints} pts
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-400/15 bg-slate-950/55 px-4 py-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Verified At
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {completion.completedAt}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-400/15 bg-slate-950/55 px-4 py-3">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Tile Record
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {completion.tileKey} · {completion.tileLabel}
                </p>
              </div>
            </div>

            <a
              href={completion.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-slate-400/15 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 no-underline transition hover:bg-white"
            >
              Open proof
            </a>
          </div>
        ) : null}

        {tile.state === 'unlocked' ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              await onSubmit(proofUrl)
            }}
          >
            <div className="rounded-[1.6rem] border border-cyan-300/12 bg-cyan-400/8 p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-cyan-200">
                Submission Window
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Submit a proof URL for this tile. Server validation and live
                board refresh behavior are unchanged.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-200">
                Proof URL
              </span>
              <input
                type="url"
                value={proofUrl}
                onChange={(event) => setProofUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-slate-400/15 bg-slate-950/75 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                required
              />
            </label>

            {!canSubmit ? (
              <p className="rounded-2xl border border-amber-300/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                This board is read-only right now. Submissions are currently
                closed.
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-2xl border border-rose-300/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-slate-400/15 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="rounded-2xl border border-cyan-300/20 bg-gradient-to-b from-cyan-300 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit completion'}
              </button>
            </div>
          </form>
        ) : null}

        {tile.state === 'hidden' ? (
          <div className="mt-6 rounded-[1.6rem] border border-slate-400/15 bg-slate-900/70 p-5 text-sm leading-6 text-slate-400">
            This tile is still hidden and cannot be interacted with yet.
          </div>
        ) : null}
      </div>
    </div>
  )
}
