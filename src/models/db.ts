import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export type JsonPrimitive = boolean | number | string | null
export type JsonValue = JsonPrimitive | JsonArray | JsonObject
export interface JsonArray extends Array<JsonValue> {}
export interface JsonObject {
  [key: string]: JsonValue
}

export type EventStatus = 'draft' | 'active' | 'completed' | 'archived'

export interface UsersTable {
  id: Generated<string>
  keycloak_id: string
  name: string
  email: string
  roles: string[]
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface EventsTable {
  id: Generated<string>
  name: string
  status: EventStatus
  start_time: string | null
  duration_minutes: number | null
  board_key: string | null
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface TeamsTable {
  id: Generated<string>
  event_id: string
  name: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface TeamMembershipsTable {
  id: Generated<string>
  event_id: string
  team_id: string
  user_id: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface BoardsTable {
  id: Generated<string>
  event_id: string
  key: string
  name: string
  version: string
  layout_json: JsonValue
  created_at: Generated<string>
}

export interface BoardTilesTable {
  id: Generated<string>
  board_id: string
  tile_key: string
  label: string
  info_url: string | null
  color_tier: string
  points: number
  adjacent_tile_keys: string[]
  row_index: number
  column_index: number
  created_at: Generated<string>
}

export interface TeamTileCompletionsTable {
  id: Generated<string>
  event_id: string
  team_id: string
  board_tile_id: string
  completed_by_user_id: string
  proof_url: string
  completed_at: Generated<string>
}

export interface Database {
  users: UsersTable
  events: EventsTable
  teams: TeamsTable
  team_memberships: TeamMembershipsTable
  boards: BoardsTable
  board_tiles: BoardTilesTable
  team_tile_completions: TeamTileCompletionsTable
}

export type User = Selectable<UsersTable>
export type NewUser = Insertable<UsersTable>
export type UserUpdate = Updateable<UsersTable>

export type Event = Selectable<EventsTable>
export type NewEvent = Insertable<EventsTable>
export type EventUpdate = Updateable<EventsTable>

export type Team = Selectable<TeamsTable>
export type NewTeam = Insertable<TeamsTable>
export type TeamUpdate = Updateable<TeamsTable>

export type TeamMembership = Selectable<TeamMembershipsTable>
export type NewTeamMembership = Insertable<TeamMembershipsTable>
export type TeamMembershipUpdate = Updateable<TeamMembershipsTable>

export type Board = Selectable<BoardsTable>
export type NewBoard = Insertable<BoardsTable>

export type BoardTile = Selectable<BoardTilesTable>
export type NewBoardTile = Insertable<BoardTilesTable>

export type TeamTileCompletion = Selectable<TeamTileCompletionsTable>
export type NewTeamTileCompletion = Insertable<TeamTileCompletionsTable>
