import { getDb } from '#/lib/db/client'
import type { AuthUser, ProvisionAuthUserInput } from '#/models/auth'
import type { User } from '#/models/db'

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    keycloak_id: user.keycloak_id,
    name: user.name,
    email: user.email,
    roles: user.roles as AuthUser['roles'],
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export async function findUserById(id: string) {
  const user = await getDb()
    .selectFrom('users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()

  return user ? mapUser(user) : null
}

export async function findUserByKeycloakId(keycloakId: string) {
  const user = await getDb()
    .selectFrom('users')
    .selectAll()
    .where('keycloak_id', '=', keycloakId)
    .executeTakeFirst()

  return user ? mapUser(user) : null
}

export async function upsertUserFromKeycloak(input: ProvisionAuthUserInput) {
  const timestamp = new Date().toISOString()

  const user = await getDb()
    .insertInto('users')
    .values({
      keycloak_id: input.keycloak_id,
      name: input.name,
      email: input.email,
      roles: input.roles,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .onConflict((conflict) =>
      conflict.column('keycloak_id').doUpdateSet({
        name: input.name,
        email: input.email,
        roles: input.roles,
        updated_at: timestamp,
      }),
    )
    .returningAll()
    .executeTakeFirstOrThrow()

  return mapUser(user)
}

export async function listUsers() {
  const users = await getDb()
    .selectFrom('users')
    .selectAll()
    .orderBy('name')
    .orderBy('email')
    .execute()

  return users.map(mapUser)
}
