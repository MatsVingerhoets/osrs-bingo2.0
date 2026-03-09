import type { AppRole } from '../auth-model'

const KEYCLOAK_ROLE_TO_APP_ROLE: Record<string, AppRole> = {
  osrs_bingo_admin: 'ADMIN',
  osrs_bingo_user: 'USER',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function mapClientRolesToAppRoles(
  claims: unknown,
  clientId: string,
): AppRole[] {
  if (!isRecord(claims)) {
    return ['USER']
  }

  const resourceAccess = claims.resource_access

  if (!isRecord(resourceAccess)) {
    return ['USER']
  }

  const clientAccess = resourceAccess[clientId]

  if (!isRecord(clientAccess) || !Array.isArray(clientAccess.roles)) {
    return ['USER']
  }

  const mappedRoles = clientAccess.roles
    .flatMap((role) =>
      typeof role === 'string' && role in KEYCLOAK_ROLE_TO_APP_ROLE
        ? [KEYCLOAK_ROLE_TO_APP_ROLE[role]]
        : [],
    )
    .filter((role, index, roles) => roles.indexOf(role) === index)

  return mappedRoles.length > 0 ? mappedRoles : ['USER']
}
