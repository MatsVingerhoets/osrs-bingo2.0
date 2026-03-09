import { createFileRoute } from '@tanstack/react-router'
import { redirectResponse } from '#/features/auth/server/redirect-response'
import { sanitizeReturnTo } from '#/features/auth/server/return-to'
import { buildLoginUrl } from '#/lib/keycloak/oidc-client'
import { getOidcFlowSession } from '#/lib/session/app-session'

export const Route = createFileRoute('/auth/login')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const returnTo = sanitizeReturnTo(url.searchParams.get('returnTo'))
        const { codeVerifier, state, redirectUrl } = await buildLoginUrl()
        const oidcSession = await getOidcFlowSession()

        await oidcSession.update({
          codeVerifier,
          state,
          returnTo,
        })

        return redirectResponse(redirectUrl)
      },
    },
  },
  component: () => null,
})
