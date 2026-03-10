function getPublicEnvValue(key: keyof ImportMetaEnv, fallback: string) {
  const value = import.meta.env[key]

  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export const publicEnv = {
  appName: getPublicEnvValue('VITE_APP_NAME', 'OSRS Bingo 2.0'),
  appBaseUrl: getPublicEnvValue('VITE_APP_BASE_URL', 'http://localhost:3000'),
} as const
