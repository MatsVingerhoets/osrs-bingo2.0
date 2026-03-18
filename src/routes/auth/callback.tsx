import { createFileRoute } from '@tanstack/react-router'
import { getKeycloakIdentity } from '#/server/auth/keycloak-identity'
import { redirectResponse } from '#/server/auth/redirect-response'
import { mapClientRolesToAppRoles } from '#/server/auth/role-mapping'
import { sanitizeReturnTo } from '#/server/auth/return-to'
import { requireAuthEnv } from '#/lib/env/server'
import { exchangeAuthorizationCode } from '#/lib/keycloak/oidc-client'
import { upsertUserFromKeycloak } from '#/repositories/user-repository'
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
        console.log(
          'Keycloak callback role debug clientId=%s resource_access=%o client_roles=%o',
          authEnv.keycloakClientId,
          (claims as Record<string, unknown>).resource_access,
          (claims as Record<string, unknown>).resource_access &&
            typeof (claims as Record<string, unknown>).resource_access ===
              'object' &&
            (claims as Record<string, unknown>).resource_access !== null
            ? (
                (claims as Record<string, unknown>).resource_access as Record<
                  string,
                  unknown
                >
              )[authEnv.keycloakClientId]
            : undefined,
        )
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
