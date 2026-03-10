import { randomUUID } from 'node:crypto'
import { getDb } from '#/lib/db/client'

const TEST_PREFIX = 'test-'

export function createTestId() {
  return `${TEST_PREFIX}${randomUUID()}`
}

export async function cleanupTestData() {
  const db = getDb()

  await db
    .deleteFrom('events')
    .where('name', 'like', `${TEST_PREFIX}%`)
    .execute()

  await db
    .deleteFrom('users')
    .where('keycloak_id', 'like', `${TEST_PREFIX}%`)
    .execute()
}
