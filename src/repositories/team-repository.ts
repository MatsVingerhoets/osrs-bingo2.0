import { getDb } from '#/lib/db/client'
import type {
  NewTeam,
  NewTeamMembership,
  Team,
  TeamMembership,
} from '#/models/db'

type CreateTeamInput = Pick<NewTeam, 'event_id' | 'name'>
type AddMembershipInput = Pick<
  NewTeamMembership,
  'event_id' | 'team_id' | 'user_id'
>

export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const timestamp = new Date().toISOString()

  return getDb()
    .insertInto('teams')
    .values({
      ...input,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function listTeamsByEvent(eventId: string) {
  return getDb()
    .selectFrom('teams')
    .selectAll()
    .where('event_id', '=', eventId)
    .orderBy('name')
    .execute()
}

export async function findTeamById(teamId: string) {
  return getDb()
    .selectFrom('teams')
    .selectAll()
    .where('id', '=', teamId)
    .executeTakeFirst()
}

export async function addTeamMembership(
  input: AddMembershipInput,
): Promise<TeamMembership> {
  const timestamp = new Date().toISOString()

  return getDb()
    .insertInto('team_memberships')
    .values({
      ...input,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function assignTeamMembership(
  input: AddMembershipInput,
): Promise<TeamMembership> {
  const timestamp = new Date().toISOString()

  return getDb()
    .insertInto('team_memberships')
    .values({
      ...input,
      created_at: timestamp,
      updated_at: timestamp,
    })
    .onConflict((conflict) =>
      conflict.columns(['event_id', 'user_id']).doUpdateSet({
        team_id: input.team_id,
        updated_at: timestamp,
      }),
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function listTeamMembershipsByEvent(eventId: string) {
  return getDb()
    .selectFrom('team_memberships')
    .innerJoin('users', 'users.id', 'team_memberships.user_id')
    .innerJoin('teams', 'teams.id', 'team_memberships.team_id')
    .select([
      'team_memberships.id',
      'team_memberships.event_id',
      'team_memberships.team_id',
      'team_memberships.user_id',
      'team_memberships.created_at',
      'team_memberships.updated_at',
      'users.name as user_name',
      'users.email as user_email',
      'teams.name as team_name',
    ])
    .where('team_memberships.event_id', '=', eventId)
    .orderBy('teams.name')
    .orderBy('users.name')
    .execute()
}

export async function listTeamMembershipsByEventAndTeam(
  eventId: string,
  teamId: string,
) {
  return getDb()
    .selectFrom('team_memberships')
    .innerJoin('users', 'users.id', 'team_memberships.user_id')
    .innerJoin('teams', 'teams.id', 'team_memberships.team_id')
    .select([
      'team_memberships.id',
      'team_memberships.event_id',
      'team_memberships.team_id',
      'team_memberships.user_id',
      'team_memberships.created_at',
      'team_memberships.updated_at',
      'users.name as user_name',
      'users.email as user_email',
      'teams.name as team_name',
    ])
    .where('team_memberships.event_id', '=', eventId)
    .where('team_memberships.team_id', '=', teamId)
    .orderBy('users.name')
    .orderBy('users.email')
    .execute()
}

export async function findTeamMembershipByEventAndUser(
  eventId: string,
  userId: string,
) {
  return getDb()
    .selectFrom('team_memberships')
    .innerJoin('teams', 'teams.id', 'team_memberships.team_id')
    .select([
      'team_memberships.id',
      'team_memberships.event_id',
      'team_memberships.team_id',
      'team_memberships.user_id',
      'team_memberships.created_at',
      'team_memberships.updated_at',
      'teams.name as team_name',
    ])
    .where('team_memberships.event_id', '=', eventId)
    .where('team_memberships.user_id', '=', userId)
    .executeTakeFirst()
}
