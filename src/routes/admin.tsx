import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentAuth } from '#/features/auth/server/current-auth'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const auth = await getCurrentAuth()

    if (!auth) {
      throw redirect({
        href: `/auth/login?returnTo=${encodeURIComponent(location.href)}`,
      })
    }

    if (!auth.roles.includes('ADMIN')) {
      throw redirect({ to: '/' })
    }

    return {
      auth,
    }
  },
  component: AdminPage,
})

function AdminPage() {
  const { auth } = Route.useRouteContext()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
          Admin Area
        </p>
        <h1 className="mt-4 font-['Sora',var(--font-sans)] text-4xl font-bold tracking-[-0.04em] text-stone-950">
          Protected administration route
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          You are signed in as <strong>{auth.username}</strong> and your current
          roles are <strong>{auth.roles.join(', ')}</strong>.
        </p>
      </section>
    </main>
  )
}
