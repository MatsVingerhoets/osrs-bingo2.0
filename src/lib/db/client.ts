import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { requireDatabaseEnv } from '#/lib/env/server'
import type { Database } from '#/models/db'

let pool: Pool | null = null
let db: Kysely<Database> | null = null

function createPool() {
  const { databaseUrl } = requireDatabaseEnv()

  return new Pool({
    connectionString: databaseUrl,
    max: 10,
  })
}

export function getDb() {
  if (!pool) {
    pool = createPool()
  }

  if (!db) {
    db = new Kysely<Database>({
      dialect: new PostgresDialect({ pool }),
    })
  }

  return db
}

export async function destroyDb() {
  await db?.destroy()
  db = null
  pool = null
}
