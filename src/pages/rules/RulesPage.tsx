import type { getCurrentAuth } from '#/server/auth/current-auth'
import { TopNav } from '#/pages/index/components'

const ruleSections = [
  {
    eyebrow: 'Board Rules',
    title: 'How tiles unlock',
    items: [
      'The active board uses the fixed honeycomb layout for the current event.',
      'Initial visible tiles are 46, 57, and 58.',
      'Completed tiles remain visible for the rest of the event.',
      'An incomplete tile becomes visible when it is adjacent to a completed tile.',
      'Hidden tiles cannot be opened or submitted.',
    ],
  },
  {
    eyebrow: 'Scoring',
    title: 'How points are counted',
    items: [
      'Team score is derived from valid tile completions, not a manually edited counter.',
      'Submitting proof for an unlocked tile immediately counts for your team.',
      'Standings are recalculated from live completion data.',
      'Legacy bonus rules such as ring multipliers are out of scope for this build.',
    ],
  },
  {
    eyebrow: 'Proof',
    title: 'How submissions work',
    items: [
      'Proof is submitted as a URL to externally hosted evidence.',
      'The app records which signed-in user submitted the tile.',
      'Completed tiles can be reopened to inspect proof and attribution details.',
      'Admins can invalidate a completion, which immediately updates scoring and visibility.',
    ],
  },
] as const

type RulesPageProps = {
  auth: Awaited<ReturnType<typeof getCurrentAuth>>
}

export function RulesPage({ auth }: RulesPageProps) {
  if (!auth) {
    return null
  }

  const navActions = [
    {
      kind: 'link' as const,
      label: 'Home',
      to: '/',
    },
    ...(auth.roles.includes('ADMIN')
      ? [
          {
            kind: 'link' as const,
            label: 'Admin',
            to: '/admin',
          },
        ]
      : []),
    {
      kind: 'href' as const,
      label: 'Logout',
      href: '/auth/logout?returnTo=/rules',
    },
  ]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_20%),radial-gradient(circle_at_right,rgba(59,130,246,0.08),transparent_26%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)] px-4 py-2.5 text-white sm:px-5 sm:py-3 lg:px-6 lg:py-4">
      <div className="mx-auto">
        <TopNav
          appName="OSRS Bingo 2.0"
          eventName="Rules"
          playerName={auth.name}
          actions={navActions}
        />

        <section className="rounded-[1.8rem] border border-slate-400/15 bg-gradient-to-b from-slate-900/95 to-slate-950 p-6 shadow-[0_22px_56px_rgba(2,6,23,0.32)] sm:p-7">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Rules
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white">
            Event rules and gameplay notes
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            This page summarizes the rules currently implemented in the app.
            Scoring, tile visibility, submissions, and standings all resolve
            from live event data rather than manual updates.
          </p>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          {ruleSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.45rem] border border-slate-400/15 bg-slate-900/80 p-5 shadow-[0_16px_30px_rgba(2,6,23,0.24)]"
            >
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-cyan-300">
                {section.eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl bg-slate-950/65 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
