function readOptional(key: string) {
  const value = process.env[key]

  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readRequired(key: string) {
  const value = readOptional(key)

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const serverEnv = {
  nodeEnv: readOptional('NODE_ENV') ?? 'development',
  appName: readOptional('APP_NAME') ?? 'OSRS Bingo 2.0',
  appBaseUrl: readOptional('APP_BASE_URL') ?? 'http://localhost:3000',
  databaseUrl: readOptional('DATABASE_URL'),
  sessionSecret: readOptional('SESSION_SECRET'),
  sessionMaxAgeSeconds: Number.parseInt(
    readOptional('SESSION_MAX_AGE_SECONDS') ?? '28800',
    10,
  ),
  keycloakIssuerUrl: readOptional('KEYCLOAK_ISSUER_URL'),
  keycloakClientId: readOptional('KEYCLOAK_CLIENT_ID'),
  keycloakClientSecret: readOptional('KEYCLOAK_CLIENT_SECRET'),
  keycloakUsernameClaim:
    readOptional('KEYCLOAK_USERNAME_CLAIM') ?? 'preferred_username',
} as const

export function requireDatabaseEnv() {
  return {
    databaseUrl: readRequired('DATABASE_URL'),
  }
}

export function requireAuthEnv() {
  return {
    sessionSecret: readRequired('SESSION_SECRET'),
    keycloakIssuerUrl: readRequired('KEYCLOAK_ISSUER_URL'),
    keycloakClientId: readRequired('KEYCLOAK_CLIENT_ID'),
    keycloakClientSecret: readRequired('KEYCLOAK_CLIENT_SECRET'),
    keycloakUsernameClaim:
      readOptional('KEYCLOAK_USERNAME_CLAIM') ?? 'preferred_username',
  }
}
