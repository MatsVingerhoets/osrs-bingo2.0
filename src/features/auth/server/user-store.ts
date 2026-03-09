import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import type { AuthUser, ProvisionAuthUserInput } from '../auth-model'

interface UserStoreData {
  users: AuthUser[]
}

const USER_STORE_PATH = join(process.cwd(), '.data', 'auth-users.json')

async function ensureUserStore() {
  await mkdir(dirname(USER_STORE_PATH), { recursive: true })

  try {
    await readFile(USER_STORE_PATH, 'utf8')
  } catch {
    await writeFile(
      USER_STORE_PATH,
      JSON.stringify({ users: [] satisfies AuthUser[] }, null, 2),
      'utf8',
    )
  }
}

async function readUserStore(): Promise<UserStoreData> {
  await ensureUserStore()
  const contents = await readFile(USER_STORE_PATH, 'utf8')
  return JSON.parse(contents) as UserStoreData
}

async function writeUserStore(data: UserStoreData) {
  await ensureUserStore()
  await writeFile(USER_STORE_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function findUserById(id: string) {
  const store = await readUserStore()
  return store.users.find((user) => user.id === id) ?? null
}

export async function upsertUserFromKeycloak(input: ProvisionAuthUserInput) {
  const store = await readUserStore()
  const existingUser = store.users.find(
    (user) => user.keycloakId === input.keycloakId,
  )
  const timestamp = new Date().toISOString()

  if (existingUser) {
    const updatedUser: AuthUser = {
      ...existingUser,
      roles: input.roles,
      updatedAt: timestamp,
    }

    await writeUserStore({
      users: store.users.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    })

    return updatedUser
  }

  const createdUser: AuthUser = {
    id: randomUUID(),
    keycloakId: input.keycloakId,
    username: input.username,
    email: input.email,
    roles: input.roles,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await writeUserStore({
    users: [...store.users, createdUser],
  })

  return createdUser
}
