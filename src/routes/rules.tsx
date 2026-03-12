import { createFileRoute } from '@tanstack/react-router'
import { RulesPage } from '#/pages/rules/RulesPage'
import { getCurrentAuth } from '#/server/auth/current-auth'

export const Route = createFileRoute('/rules')({
  loader: async () => ({
    auth: await getCurrentAuth(),
  }),
  component: RulesRouteComponent,
})

function RulesRouteComponent() {
  const { auth } = Route.useLoaderData()
  return <RulesPage auth={auth} />
}
