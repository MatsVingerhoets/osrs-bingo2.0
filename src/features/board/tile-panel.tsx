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
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(24,17,11,0.52)] p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-[1.9rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,249,241,0.98),rgba(247,239,226,0.96))] p-6 shadow-[0_20px_80px_rgba(24,17,11,0.28)] backdrop-blur-[16px] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
              Tile {tile.tileKey}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-950">
              {tile.label}
            </h3>
            <p className="mt-2 text-sm text-stone-600">{tile.points} points</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[rgba(87,57,24,0.12)] px-3 py-1.5 text-sm font-semibold text-stone-700"
          >
            Close
          </button>
        </div>

        {tile.state === 'completed' && completion ? (
          <div className="mt-6 space-y-3 rounded-3xl border border-[rgba(98,117,67,0.18)] bg-[rgba(219,235,195,0.54)] p-5">
            <p className="text-sm font-semibold text-[#415329]">
              Completed by {completion.completedByName}
            </p>
            <p className="text-sm text-stone-700">{completion.completedAt}</p>
            <a
              href={completion.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-[rgba(87,57,24,0.14)] bg-white/70 px-4 py-2 text-sm font-semibold text-stone-900 no-underline"
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
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-stone-800">
                Proof URL
              </span>
              <input
                type="url"
                value={proofUrl}
                onChange={(event) => setProofUrl(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-[rgba(87,57,24,0.16)] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#97510f]"
                required
              />
            </label>

            {errorMessage ? (
              <p className="rounded-2xl border border-[rgba(164,46,46,0.16)] bg-[rgba(255,232,232,0.74)] px-4 py-3 text-sm text-[#8d2828]">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full rounded-2xl border border-[rgba(87,57,24,0.14)] bg-[linear-gradient(180deg,#9f5614,#7e4310)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit completion'}
            </button>
          </form>
        ) : null}

        {tile.state === 'hidden' ? (
          <div className="mt-6 rounded-3xl border border-[rgba(87,57,24,0.1)] bg-white/50 p-5 text-sm text-stone-600">
            This tile is still hidden and cannot be interacted with yet.
          </div>
        ) : null}
      </div>
    </div>
  )
}
