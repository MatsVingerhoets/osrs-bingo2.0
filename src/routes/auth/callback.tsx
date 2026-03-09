import { createFileRoute } from '@tanstack/react-router'
import { getKeycloakIdentity } from '#/features/auth/server/keycloak-identity'
import { redirectResponse } from '#/features/auth/server/redirect-response'
import { mapClientRolesToAppRoles } from '#/features/auth/server/role-mapping'
import { sanitizeReturnTo } from '#/features/auth/server/return-to'
import { upsertUserFromKeycloak } from '#/features/auth/server/user-store'
import { requireAuthEnv } from '#/lib/env/server'
import { exchangeAuthorizationCode } from '#/lib/keycloak/oidc-client'
import { getOidcFlowSession, saveAppSession } from '#/lib/session/app-session'

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const oidcSession = await getOidcFlowSession()
        const codeVerifier = oidcSession.data.codeVerifier
        const state = oidcSession.data.state
        const returnTo = sanitizeReturnTo(oidcSession.data.returnTo)

        if (!codeVerifier || !state) {
          return new Response('Missing OIDC login session state', {
            status: 400,
          })
        }

        const tokenResponse = await exchangeAuthorizationCode(
          request.url,
          codeVerifier,
          state,
        )
        const claims = tokenResponse.claims()

        if (!claims) {
          return new Response('Missing ID token claims', { status: 400 })
        }

        const authEnv = requireAuthEnv()
        const identity = getKeycloakIdentity(claims as Record<string, unknown>)
        const roles = mapClientRolesToAppRoles(
          claims as Record<string, unknown>,
          authEnv.keycloakClientId,
        )
        const user = await upsertUserFromKeycloak({
          ...identity,
          roles,
        })

        await saveAppSession({
          userId: user.id,
          roles: user.roles,
        })
        await oidcSession.clear()

        return redirectResponse(new URL(returnTo, request.url))
      },
    },
  },
  component: () => null,
})
