import * as oidc from 'openid-client'
import { requireAuthEnv, serverEnv } from '#/lib/env/server'

let oidcConfigurationPromise: Promise<oidc.Configuration> | undefined

export function getKeycloakRedirectUri() {
  return new URL('/auth/callback', serverEnv.appBaseUrl).toString()
}

export function getPostLogoutRedirectUri() {
  return new URL('/auth/logout?loggedOut=1', serverEnv.appBaseUrl).toString()
}

export function getOidcConfiguration() {
  if (!oidcConfigurationPromise) {
    const authEnv = requireAuthEnv()

    oidcConfigurationPromise = oidc.discovery(
      new URL(authEnv.keycloakIssuerUrl),
      authEnv.keycloakClientId,
      undefined,
      oidc.ClientSecretPost(authEnv.keycloakClientSecret),
    )
  }

  return oidcConfigurationPromise
}

export async function buildLoginUrl() {
  const config = await getOidcConfiguration()
  const codeVerifier = oidc.randomPKCECodeVerifier()
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
  const state = oidc.randomState()
  const redirectUri = getKeycloakRedirectUri()

  console.log('OIDC buildLoginUrl redirectUri=%s', redirectUri)

  return {
    codeVerifier,
    state,
    redirectUrl: oidc.buildAuthorizationUrl(config, {
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    }),
  }
}

export async function exchangeAuthorizationCode(
  requestUrl: string,
  codeVerifier: string,
  expectedState: string,
) {
  const config = await getOidcConfiguration()
  const redirectUri = getKeycloakRedirectUri()
  const normalizedRequestUrl = new URL(requestUrl)
  const publicRedirectUrl = new URL(redirectUri)

  normalizedRequestUrl.protocol = publicRedirectUrl.protocol
  normalizedRequestUrl.username = publicRedirectUrl.username
  normalizedRequestUrl.password = publicRedirectUrl.password
  normalizedRequestUrl.host = publicRedirectUrl.host

  console.log(
    'OIDC exchangeAuthorizationCode redirectUri=%s requestUrl=%s normalizedRequestUrl=%s',
    redirectUri,
    requestUrl,
    normalizedRequestUrl.toString(),
  )

  return oidc.authorizationCodeGrant(config, normalizedRequestUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
  })
}

export async function buildLogoutUrl() {
  const config = await getOidcConfiguration()
  const endSessionEndpoint = config.serverMetadata().end_session_endpoint

  if (!endSessionEndpoint) {
    return null
  }

  const authEnv = requireAuthEnv()
  const logoutUrl = new URL(endSessionEndpoint)
  logoutUrl.searchParams.set('client_id', authEnv.keycloakClientId)
  logoutUrl.searchParams.set(
    'post_logout_redirect_uri',
    getPostLogoutRedirectUri(),
  )

  return logoutUrl
}
