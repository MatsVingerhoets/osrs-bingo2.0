export const APP_ROLE_VALUES = ['ADMIN', 'USER'] as const

export type AppRole = (typeof APP_ROLE_VALUES)[number]

export interface AuthUser {
  id: string
  keycloakId: string
  username: string
  email: string
  roles: AppRole[]
  createdAt: string
  updatedAt: string
}

export interface ProvisionAuthUserInput {
  keycloakId: string
  username: string
  email: string
  roles: AppRole[]
}
