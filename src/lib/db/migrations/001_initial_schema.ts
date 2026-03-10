import { sql } from 'kysely'
import type { Kysely } from 'kysely'
import type { Database } from '#/models/db'

const eventStatuses = ["'draft'", "'active'", "'completed'", "'archived'"].join(
  ', ',
)

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`create extension if not exists pgcrypto`.execute(db)

  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('keycloak_id', 'text', (column) => column.notNull().unique())
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('email', 'text', (column) => column.notNull().unique())
    .addColumn('roles', sql`text[]`, (column) =>
      column.notNull().defaultTo(sql`array[]::text[]`),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute()

  await db.schema
    .createTable('events')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('status', 'text', (column) => column.notNull())
    .addColumn('start_time', 'timestamptz')
    .addColumn('duration_minutes', 'integer')
    .addColumn('board_key', 'text')
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addCheckConstraint(
      'events_status_valid',
      sql.raw(`status in (${eventStatuses})`),
    )
    .addCheckConstraint(
      'events_duration_minutes_nonnegative',
      sql`duration_minutes is null or duration_minutes >= 0`,
    )
    .execute()

  await sql`create unique index if not exists events_single_active_idx on events ((status)) where status = 'active'`.execute(
    db,
  )

  await db.schema
    .createTable('teams')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (column) =>
      column.notNull().references('events.id').onDelete('cascade'),
    )
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint('teams_id_event_id_unique', ['id', 'event_id'])
    .addUniqueConstraint('teams_event_id_name_unique', ['event_id', 'name'])
    .execute()

  await db.schema
    .createTable('team_memberships')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (column) => column.notNull())
    .addColumn('team_id', 'uuid', (column) => column.notNull())
    .addColumn('user_id', 'uuid', (column) =>
      column.notNull().references('users.id').onDelete('cascade'),
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updated_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint(
      'team_memberships_team_event_fk',
      ['team_id', 'event_id'],
      'teams',
      ['id', 'event_id'],
      (constraint) => constraint.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'team_memberships_event_fk',
      ['event_id'],
      'events',
      ['id'],
      (constraint) => constraint.onDelete('cascade'),
    )
    .addUniqueConstraint('team_memberships_event_user_unique', [
      'event_id',
      'user_id',
    ])
    .addUniqueConstraint('team_memberships_team_user_unique', ['team_id', 'user_id'])
    .execute()

  await db.schema
    .createTable('boards')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (column) =>
      column.notNull().references('events.id').onDelete('cascade').unique(),
    )
    .addColumn('key', 'text', (column) => column.notNull())
    .addColumn('name', 'text', (column) => column.notNull())
    .addColumn('version', 'text', (column) => column.notNull())
    .addColumn('layout_json', 'jsonb', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .execute()

  await db.schema
    .createTable('board_tiles')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('board_id', 'uuid', (column) =>
      column.notNull().references('boards.id').onDelete('cascade'),
    )
    .addColumn('tile_key', 'text', (column) => column.notNull())
    .addColumn('label', 'text', (column) => column.notNull())
    .addColumn('info_url', 'text')
    .addColumn('color_tier', 'text', (column) => column.notNull())
    .addColumn('points', 'integer', (column) => column.notNull())
    .addColumn('adjacent_tile_keys', sql`text[]`, (column) =>
      column.notNull().defaultTo(sql`array[]::text[]`),
    )
    .addColumn('row_index', 'integer', (column) => column.notNull())
    .addColumn('column_index', 'integer', (column) => column.notNull())
    .addColumn('created_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addCheckConstraint('board_tiles_points_nonnegative', sql`points >= 0`)
    .addUniqueConstraint('board_tiles_board_tile_key_unique', ['board_id', 'tile_key'])
    .addUniqueConstraint('board_tiles_board_position_unique', [
      'board_id',
      'row_index',
      'column_index',
    ])
    .execute()

  await db.schema
    .createTable('team_tile_completions')
    .ifNotExists()
    .addColumn('id', 'uuid', (column) =>
      column.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('event_id', 'uuid', (column) => column.notNull())
    .addColumn('team_id', 'uuid', (column) => column.notNull())
    .addColumn('board_tile_id', 'uuid', (column) =>
      column.notNull().references('board_tiles.id').onDelete('cascade'),
    )
    .addColumn('completed_by_user_id', 'uuid', (column) =>
      column.notNull().references('users.id').onDelete('restrict'),
    )
    .addColumn('proof_url', 'text', (column) => column.notNull())
    .addColumn('completed_at', 'timestamptz', (column) =>
      column.notNull().defaultTo(sql`now()`),
    )
    .addForeignKeyConstraint(
      'team_tile_completions_team_event_fk',
      ['team_id', 'event_id'],
      'teams',
      ['id', 'event_id'],
      (constraint) => constraint.onDelete('cascade'),
    )
    .addForeignKeyConstraint(
      'team_tile_completions_event_fk',
      ['event_id'],
      'events',
      ['id'],
      (constraint) => constraint.onDelete('cascade'),
    )
    .addUniqueConstraint('team_tile_completions_team_tile_unique', [
      'team_id',
      'board_tile_id',
    ])
    .execute()

  await db.schema
    .createIndex('team_tile_completions_event_team_completed_at_idx')
    .ifNotExists()
    .on('team_tile_completions')
    .columns(['event_id', 'team_id', 'completed_at'])
    .execute()

  await db.schema
    .createIndex('team_tile_completions_event_user_completed_at_idx')
    .ifNotExists()
    .on('team_tile_completions')
    .columns(['event_id', 'completed_by_user_id', 'completed_at'])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex('team_tile_completions_event_user_completed_at_idx').ifExists().execute()
  await db.schema.dropIndex('team_tile_completions_event_team_completed_at_idx').ifExists().execute()
  await db.schema.dropTable('team_tile_completions').ifExists().execute()
  await db.schema.dropTable('board_tiles').ifExists().execute()
  await db.schema.dropTable('boards').ifExists().execute()
  await db.schema.dropTable('team_memberships').ifExists().execute()
  await db.schema.dropTable('teams').ifExists().execute()
  await sql`drop index if exists events_single_active_idx`.execute(db)
  await db.schema.dropTable('events').ifExists().execute()
  await db.schema.dropTable('users').ifExists().execute()
}
