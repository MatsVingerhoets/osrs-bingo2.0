import { getDb } from '#/lib/db/client'
import type { NewTeamTileCompletion, TeamTileCompletion } from '#/models/db'

type CreateCompletionInput = Pick<
  NewTeamTileCompletion,
  | 'event_id'
  | 'team_id'
  | 'board_tile_id'
  | 'completed_by_user_id'
  | 'proof_url'
>

export async function createTeamTileCompletion(
  input: CreateCompletionInput,
): Promise<TeamTileCompletion> {
  return getDb()
    .insertInto('team_tile_completions')
    .values({
      ...input,
      completed_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function deleteTeamTileCompletion(id: string) {
  return getDb()
    .deleteFrom('team_tile_completions')
    .where('id', '=', id)
    .returning(['id'])
    .executeTakeFirst()
}

export async function listCompletionInspectionRows(eventId: string) {
  return getDb()
    .selectFrom('team_tile_completions')
    .innerJoin('teams', 'teams.id', 'team_tile_completions.team_id')
    .innerJoin(
      'users',
      'users.id',
      'team_tile_completions.completed_by_user_id',
    )
    .innerJoin(
      'board_tiles',
      'board_tiles.id',
      'team_tile_completions.board_tile_id',
    )
    .select([
      'team_tile_completions.id',
      'team_tile_completions.event_id',
      'team_tile_completions.team_id',
      'team_tile_completions.board_tile_id',
      'team_tile_completions.completed_by_user_id',
      'team_tile_completions.proof_url',
      'team_tile_completions.completed_at',
      'teams.name as team_name',
      'users.name as submitted_by_name',
      'users.email as submitted_by_email',
      'board_tiles.label as tile_label',
      'board_tiles.tile_key',
    ])
    .where('team_tile_completions.event_id', '=', eventId)
    .orderBy('team_tile_completions.completed_at', 'desc')
    .execute()
}

export async function listTeamTileCompletions(eventId: string, teamId: string) {
  return getDb()
    .selectFrom('team_tile_completions')
    .innerJoin(
      'board_tiles',
      'board_tiles.id',
      'team_tile_completions.board_tile_id',
    )
    .innerJoin(
      'users',
      'users.id',
      'team_tile_completions.completed_by_user_id',
    )
    .select([
      'team_tile_completions.id',
      'team_tile_completions.event_id',
      'team_tile_completions.team_id',
      'team_tile_completions.board_tile_id',
      'team_tile_completions.completed_by_user_id',
      'team_tile_completions.proof_url',
      'team_tile_completions.completed_at',
      'board_tiles.tile_key',
      'board_tiles.label as tile_label',
      'board_tiles.points as tile_points',
      'users.name as completed_by_name',
    ])
    .where('team_tile_completions.event_id', '=', eventId)
    .where('team_tile_completions.team_id', '=', teamId)
    .orderBy('team_tile_completions.completed_at', 'desc')
    .execute()
}
