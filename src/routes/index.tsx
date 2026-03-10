import { createFileRoute, Link } from '@tanstack/react-router'
import { getCurrentAuth } from '#/server/auth/current-auth'
import { publicEnv } from '#/lib/env/public'

const authItems = [
  'Keycloak OIDC redirects are handled through openid-client.',
  'A database-backed local user record is provisioned on login.',
  'A cookie-only local session stores user id and roles.',
  'Unauthenticated users are redirected into login automatically.',
  'Client roles are mapped into the local roles array on login.',
]

const nextSlices = [
  'Canonical board import and domain rules',
  'Admin workflows and gameplay screens',
  'Hardening, constraints, and verification',
]

export const Route = createFileRoute('/')({
  loader: async () => getCurrentAuth(),
  component: HomePage,
})

function HomePage() {
  const auth = Route.useLoaderData()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-10 overflow-hidden rounded-4xl border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] px-6 py-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:px-10 sm:py-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-[rgba(151,81,15,0.18)] bg-[rgba(255,248,238,0.72)] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#97510f]">
            OSRS Bingo 2.0
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-['Sora',var(--font-sans)] text-4xl leading-[0.98] font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Phase 3 is live: the app now runs on the initial database layer.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
              You are signed in as <strong>{auth?.name}</strong>. Authentication
              is active, `/admin` remains role-gated, and logins now provision
              and update the local user through the Postgres-backed repository
              layer.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              App: {publicEnv.appName}
            </span>
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              User: {auth?.email}
            </span>
            <span className="rounded-full border border-[rgba(87,57,24,0.14)] bg-[rgba(255,251,245,0.82)] px-4 py-2.5 text-stone-600">
              Roles: {auth?.roles.join(', ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(255,248,238,0.92)] px-5 py-2.5 text-sm font-semibold text-stone-800 no-underline"
            >
              Admin
            </Link>
            <a
              href="/auth/logout?returnTo=/"
              className="rounded-full border border-[rgba(87,57,24,0.18)] bg-[rgba(151,81,15,0.08)] px-5 py-2.5 text-sm font-semibold text-[#97510f] no-underline"
            >
              Log Out
            </a>
          </div>
        </div>

        <aside className="rounded-3xl border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Phase 3 Status
          </p>
          <ul className="mt-4 space-y-3 text-sm text-stone-700">
            {authItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Persistence Shape
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            App-owned auth now sits on top of the typed persistence layer.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
            OIDC is handled by{' '}
            <code className="rounded-lg border border-white/15 bg-[rgba(30,20,10,0.92)] px-1.5 py-0.5 text-stone-100">
              openid-client
            </code>
            , while Kysely-backed repositories own local user persistence,
            schema boundaries, and query behavior. The app session remains
            narrow and only stores the current user id plus roles.
          </p>
          <div className="mt-6 rounded-2xl bg-[linear-gradient(180deg,rgba(44,31,18,0.96),rgba(25,18,10,0.98))] px-4 py-4">
            <pre className="overflow-x-auto text-sm leading-6 text-stone-200">
              <code>{`session = {
  userId: string
  roles: AppRole[]
}`}</code>
            </pre>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-6 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px] sm:p-8">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
            Next Stages
          </p>
          <div className="mt-4 grid gap-3">
            {nextSlices.map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(87,57,24,0.12)] bg-[rgba(255,252,248,0.74)] px-4 py-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Phase {index + 4}
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-900">{item}</p>
                </div>
                <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600">
                  Planned
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
