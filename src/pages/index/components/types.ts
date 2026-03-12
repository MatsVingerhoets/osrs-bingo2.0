import type { ReactNode } from 'react'

export type NavAction =
  | {
      kind: 'link'
      label: string
      to: string
    }
  | {
      kind: 'href'
      label: string
      href: string
    }
  | {
      kind: 'text'
      label: string
      value: string
    }

export type TopNavProps = {
  appName: string
  eventName?: string | null
  playerName: string
  teamName?: string | null
  actions?: readonly NavAction[]
}

export type BoardMetric = {
  label: string
  value: string | number
}

export type BoardShellProps = {
  eyebrow: string
  title: string
  description: string
  metrics: readonly BoardMetric[]
  children: ReactNode
}

export type TeamSummary = {
  teamName: string
  score: number
  rank: number
  totalTeams: number
  gapToAbove: number | null
  gapToBelow: number | null
  completedTileCount: number
  visibleTileCount: number
  unlockedTileCount: number
  totalTileCount: number
  boardStatusLabel: string
  boardStatusValue: string
  boardDetail: string
}

export type ContributionEntry = {
  key: string
  name: string
  score: number
  completedTileCount: number
  tileKeys: readonly string[]
}

export type RecentCompletionEntry = {
  id: string
  tileKey: string
  tileLabel: string
  tilePoints: number
  completedByName: string
  completedAtLabel: string
}

export type OtherTeamStandingEntry = {
  teamId: string
  teamName: string
  rank: number
  score: number
}

export type RightRailProps = {
  summary: TeamSummary
  otherTeams: readonly OtherTeamStandingEntry[]
  contributions: readonly ContributionEntry[]
  recentCompletions: readonly RecentCompletionEntry[]
  onSelectCompletion?: (tileKey: string) => void
}

export type StatusPanelProps = {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}
