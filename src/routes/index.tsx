import { createFileRoute } from '@tanstack/react-router'
import { getCurrentEventContext } from '#/features/events/current-event-context'
import { IndexPage } from '#/pages/index/page'
import { getCurrentAuth } from '#/server/auth/current-auth'

export const Route = createFileRoute('/')({
  loader: async () => ({
    auth: await getCurrentAuth(),
    currentEvent: await getCurrentEventContext(),
  }),
  component: IndexRouteComponent,
})

function IndexRouteComponent() {
  const { auth, currentEvent } = Route.useLoaderData()
  return <IndexPage auth={auth} currentEvent={currentEvent} />
}
