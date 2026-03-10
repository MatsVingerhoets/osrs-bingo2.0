import { getDb } from '#/lib/db/client'
import { importBoardForEvent } from '#/features/board/board-import'
import type { Event, EventStatus, EventUpdate, NewEvent } from '#/models/db'

type CreateEventInput = Pick<
  NewEvent,
  'name' | 'status' | 'start_time' | 'duration_minutes' | 'board_key'
>

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const timestamp = new Date().toISOString()

  return getDb()
    .transaction()
    .execute(async (trx) => {
      const createdEvent = await trx
        .insertInto('events')
        .values({
          ...input,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      if (createdEvent.board_key) {
        await importBoardForEvent(trx, createdEvent.id, createdEvent.board_key)
      }

      return createdEvent
    })
}

export async function findEventById(id: string) {
  return getDb()
    .selectFrom('events')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()
}

export async function findEventByName(name: string) {
  return getDb()
    .selectFrom('events')
    .selectAll()
    .where('name', '=', name)
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
  return getDb()
    .selectFrom('events')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute()
}

export async function updateEvent(
  id: string,
  input: EventUpdate,
): Promise<Event | undefined> {
  const updated = await getDb()
    .updateTable('events')
    .set({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  return updated
}
