import { requireAuthEnv } from '#/lib/env/server'

function getStringClaim(claims: Record<string, unknown>, claimName: string) {
  const value = claims[claimName]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function getKeycloakIdentity(claims: Record<string, unknown>) {
  const authEnv = requireAuthEnv()
  const keycloakId = getStringClaim(claims, 'sub')
  const email = getStringClaim(claims, 'email')
  const username =
    getStringClaim(claims, authEnv.keycloakUsernameClaim) ??
    getStringClaim(claims, 'preferred_username') ??
    getStringClaim(claims, 'username') ??
    (email ? email.split('@')[0] : undefined)

  if (!keycloakId || !email || !username) {
    throw new Error('Keycloak callback is missing required identity claims')
  }

  return {
    keycloakId,
    username,
    email,
  }
}
