import { sql } from 'kysely'
import type { Kysely } from 'kysely'
import type { Database } from '#/models/db'

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`create unique index if not exists events_name_unique_idx on events (name)`.execute(
    db,
  )
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`drop index if exists events_name_unique_idx`.execute(db)
}
