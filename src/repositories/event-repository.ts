import { getDb } from '#/lib/db/client'
import type { Event, EventStatus, NewEvent } from '#/models/db'

type CreateEventInput = Pick<
  NewEvent,
  'name' | 'status' | 'start_time' | 'duration_minutes' | 'board_key'
>

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const timestamp = new Date().toISOString()

  return getDb()
    .insertInto('events')
    .values({
      ...input,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function findEventById(id: string) {
  return getDb()
    .selectFrom('events')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function findEventByStatus(status: EventStatus) {
  return getDb()
    .selectFrom('events')
    .selectAll()
    .where('status', '=', status)
    .executeTakeFirst()
}

export async function listEvents() {
  return getDb().selectFrom('events').selectAll().orderBy('created_at', 'desc').execute()
}
