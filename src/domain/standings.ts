import type {
  BoardTileDefinition,
  TeamTileCompletionRecord,
} from '#/domain/board-state'
import { deriveTeamScore } from '#/domain/board-state'

export type EventTeam = {
  teamId: string
  teamName: string
}

export type EventTeamCompletion = TeamTileCompletionRecord & {
  teamId: string
}

export type EventTeamStanding = {
  teamId: string
  teamName: string
  score: number
  rank: number
  gapToAbove: number | null
  gapToBelow: number | null
}

function findPreviousDistinctScore(
  standings: readonly Pick<EventTeamStanding, 'score'>[],
  index: number,
) {
  const currentScore = standings[index]?.score

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const standing = standings[cursor]

    if (standing.score !== currentScore) {
      return standing.score
    }
  }

  return null
}

function findNextDistinctScore(
  standings: readonly Pick<EventTeamStanding, 'score'>[],
  index: number,
) {
  const currentScore = standings[index]?.score

  for (let cursor = index + 1; cursor < standings.length; cursor += 1) {
    const standing = standings[cursor]

    if (standing.score !== currentScore) {
      return standing.score
    }
  }

  return null
}

export function deriveEventStandings(
  tiles: BoardTileDefinition[],
  teams: readonly EventTeam[],
  completions: readonly EventTeamCompletion[],
): EventTeamStanding[] {
  const completionsByTeamId = new Map<string, TeamTileCompletionRecord[]>()

  for (const completion of completions) {
    const existingCompletions = completionsByTeamId.get(completion.teamId) ?? []

    existingCompletions.push({
      tile_key: completion.tile_key,
      completed_by_user_id: completion.completed_by_user_id,
    })
    completionsByTeamId.set(completion.teamId, existingCompletions)
  }

  const standings = teams
    .map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      score: deriveTeamScore(tiles, completionsByTeamId.get(team.teamId) ?? []),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.teamName.localeCompare(right.teamName)
    })

  let currentRank = 0
  let previousScore: number | null = null

  return standings.map((standing, index) => {
    if (previousScore === null || standing.score !== previousScore) {
      currentRank += 1
      previousScore = standing.score
    }

    const aboveScore = findPreviousDistinctScore(standings, index)
    const belowScore = findNextDistinctScore(standings, index)

    return {
      ...standing,
      rank: currentRank,
      gapToAbove: aboveScore === null ? null : aboveScore - standing.score,
      gapToBelow: belowScore === null ? null : standing.score - belowScore,
    }
  })
}
