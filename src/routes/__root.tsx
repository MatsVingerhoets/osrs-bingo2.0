import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { getCurrentAuth } from '#/features/auth/server/current-auth'
import { publicEnv } from '#/lib/env/public'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: `${publicEnv.appName} | TanStack Start`,
      },
      {
        name: 'description',
        content:
          'OSRS Bingo 2.0 scaffolded with TanStack Start, Tailwind CSS, and explicit environment boundaries.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith('/auth')) {
      return
    }

    const auth = await getCurrentAuth()

    if (!auth) {
      throw redirect({
        href: `/auth/login?returnTo=${encodeURIComponent(location.href)}`,
      })
    }

    return {
      auth,
    }
  },
  notFoundComponent: RootNotFound,
  shellComponent: RootDocument,
  component: Outlet,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(199,123,42,0.24),transparent_30%),radial-gradient(circle_at_right_20%,rgba(98,117,67,0.18),transparent_32%),linear-gradient(180deg,#f8ecd7,#efe3cf)] font-sans text-[#1f160d] antialiased before:pointer-events-none before:fixed before:inset-0 before:bg-[linear-gradient(rgba(120,85,43,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(120,85,43,0.05)_1px,transparent_1px)] before:bg-[size:26px_26px] before:[mask-image:radial-gradient(circle_at_50%_15%,black,transparent_78%)]">
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10 sm:px-10">
      <section className="w-full rounded-[2rem] border border-[rgba(87,57,24,0.12)] bg-[linear-gradient(180deg,rgba(255,248,238,0.9),rgba(255,250,240,0.72))] p-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_60px_rgba(87,57,24,0.1)] backdrop-blur-[10px]">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.22em] text-[#627543]">
          Not Found
        </p>
        <h1 className="mt-4 font-['Sora',var(--font-sans)] text-4xl font-bold tracking-[-0.04em] text-stone-950">
          That route does not exist.
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-700">
          The current URL does not match a route in the app.
        </p>
      </section>
    </main>
  )
}
