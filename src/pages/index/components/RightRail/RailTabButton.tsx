type RailTab = 'my-team' | 'other-teams'

export function RailTabButton({
  tab,
  label,
  isActive,
  onSelect,
}: {
  tab: RailTab
  label: string
  isActive: boolean
  onSelect: (tab: RailTab) => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`rail-panel-${tab}`}
      id={`rail-tab-${tab}`}
      onClick={() => onSelect(tab)}
      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        isActive
          ? 'bg-cyan-300 text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.28)]'
          : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}
