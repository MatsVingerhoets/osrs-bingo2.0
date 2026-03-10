export const APP_ROLE_VALUES = ['ADMIN', 'USER'] as const

export type AppRole = (typeof APP_ROLE_VALUES)[number]

export interface AuthUser {
  id: string
  keycloak_id: string
  name: string
  email: string
  roles: AppRole[]
  createdAt: string
  updatedAt: string
}

export interface ProvisionAuthUserInput {
  keycloak_id: string
  name: string
  email: string
  roles: AppRole[]
}
