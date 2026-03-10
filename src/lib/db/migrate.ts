import { FileMigrationProvider, Migrator } from 'kysely'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { destroyDb, getDb } from './client'

const migrationsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'migrations',
)

async function migrateToLatest() {
  const db = getDb()
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: migrationsPath,
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  for (const result of results ?? []) {
    // Keep output terse but explicit for CI/local runs.
    console.log(`${result.status}: ${result.migrationName}`)
  }

  if (error) {
    throw error
  }
}

try {
  await migrateToLatest()
} finally {
  await destroyDb()
}
