import { createFileRoute } from '@tanstack/react-router'
import { redirectResponse } from '#/features/auth/server/redirect-response'
import { sanitizeReturnTo } from '#/features/auth/server/return-to'
import { buildLogoutUrl } from '#/lib/keycloak/oidc-client'
import {
  clearAppSession,
  clearPostLogoutRedirectCookie,
  readPostLogoutRedirectCookie,
  savePostLogoutRedirectCookie,
} from '#/lib/session/app-session'

export const Route = createFileRoute('/auth/logout')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const callbackPhase = url.searchParams.get('loggedOut') === '1'

        if (callbackPhase) {
          const redirectTarget = sanitizeReturnTo(readPostLogoutRedirectCookie())
          clearPostLogoutRedirectCookie()
          return redirectResponse(new URL(redirectTarget, request.url))
        }

        const returnTo = sanitizeReturnTo(url.searchParams.get('returnTo'))
        await clearAppSession()
        savePostLogoutRedirectCookie(returnTo)

        const logoutUrl = await buildLogoutUrl()

        if (!logoutUrl) {
          clearPostLogoutRedirectCookie()
          return redirectResponse(new URL(returnTo, request.url))
        }

        return redirectResponse(logoutUrl)
      },
    },
  },
  component: () => null,
})
