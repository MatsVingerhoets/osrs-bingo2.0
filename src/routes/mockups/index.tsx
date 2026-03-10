import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/mockups/')({
  component: MockupsIndexPage,
})

function MockupsIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
          Design Mockups
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-stone-950">
          Player homepage prototype
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          This route is the active browser-viewable mockup for the player home
          design direction.
        </p>

        <div className="mt-8">
          <Link
            to="/mockups/b"
            className="rounded-[1.6rem] border border-[rgba(148,163,184,0.14)] bg-[linear-gradient(180deg,#0f172a,#020617)] p-6 text-white no-underline shadow-[0_20px_50px_rgba(2,6,23,0.24)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Active Mockup
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Competitive / modern
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Cleaner, sharper, more restrained.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
