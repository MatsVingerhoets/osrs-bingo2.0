# Player Home Design Research

## Purpose

This document captures the product context and current design direction for the main authenticated player page of the OSRS Bingo 2.0 app. It exists so future design and implementation work can continue without depending on chat history.

## App Summary

OSRS Bingo 2.0 is a rewrite of an Old School RuneScape team-vs-team bingo app.

Core product characteristics:

- players authenticate through Keycloak OIDC
- one event is active at a time
- gameplay centers on a fixed honeycomb bingo board
- tiles move through `hidden`, `unlocked`, and `completed` states
- players submit proof URLs for unlocked tiles
- completions count immediately for the team
- admins manage event setup, teams, assignments, and invalidations

This is not primarily a public marketing site. The main product experience is the signed-in player board view.

## Current Route Reality

At the time this document was created:

- `/` is the authenticated player home
- the page already loads current event context and team board state
- admin tooling lives on `/admin`
- a rules page does not exist yet, but the future design should leave room for it in navigation

Design work for the "main page" should therefore assume a logged-in player-first experience unless product scope changes later.

## Primary UX Goal

When a logged-in player lands on the main page, they should immediately understand:

1. what event/team context they are in
2. the current state of their team's board
3. what they can act on right now
4. how their team is performing relative to other teams

The board should be the dominant focal point.

## Required Homepage Elements

### Board

The player's team board state is the centerpiece of the page.

Requirements:

- the honeycomb board should dominate the layout
- hidden, unlocked, and completed states must remain visually distinct
- tile interaction should still feel fast and obvious
- the design should support the existing submit-proof flow

### Top Navigation

The page should have a small top navigation, not a large marketing header.

Required nav items:

- user/account info area
- logout button
- link to rules

Notes:

- the rules route does not exist yet
- the design can still include a placeholder nav link or planned destination

### Team / Standings Card

The player also needs a compact but useful stats area showing competitive context.

Required information:

- the player's team standing/rank
- the player's team total points
- a leaderboard of users on the player's team with their contributed points
- the total points of other teams

Constraint:

- other teams only need team totals
- no per-user leaderboard is needed for rival teams

Current interaction idea:

- use tabs inside the card
- one tab for `My Team`
- one tab for `Other Teams`

This is a strong candidate because it keeps the board visually primary while still making standings easy to inspect.

## Visual Direction

High-level direction from the user:

- somewhat dark themed
- avoid bright or flashbang-like screens

Implications:

- use a dark or dark-leaning surface palette
- keep contrast readable without pure-black heaviness
- use RuneScape-adjacent warmth or mineral/metal tones carefully
- preserve clear tile state differentiation inside a darker shell
- avoid overusing neon accents that would overpower the board

## Page Hierarchy Recommendation

Current recommended hierarchy:

1. slim top navigation
2. primary board area
3. adjacent secondary card for standings and team context
4. modal/panel interaction for tile details and proof submission

This likely means a layout where:

- desktop: board occupies the main column and standings sit in a narrower side column
- mobile: nav stays compact, standings collapse below the board, and tabs reduce vertical sprawl

## Content Strategy

The page should feel like a live operations surface for players, not a generic dashboard.

That means:

- emphasize the board over decorative summary metrics
- keep copy short and operational
- reduce non-essential status noise near the top
- make rankings and points scannable
- reserve detail for the tile panel and standings card

## Design Principles For This Screen

- board first
- dark, calm, and readable
- competitive context without clutter
- minimal top-level navigation
- obvious action states
- mobile-safe without collapsing the board identity

## Proposed Information Architecture

### Header / Nav

- app or event identifier
- rules link
- user identity summary
- logout action

### Main Content

- large board section
- side card for standings

### Standings Card

`My Team` tab:

- team name
- current standing
- total team points
- roster leaderboard by contribution points

`Other Teams` tab:

- ranked list of other teams
- total points only

## Decisions Made In This Research Pass

- the signed-in player homepage is the immediate design target
- the board is the primary focal element
- navigation should stay small and utility-focused
- standings belong in a secondary card, not above the board
- a tabbed standings card is the leading direction
- the visual theme should move darker than the current warm light UI

## Open Questions

These do not block early design exploration, but they should be resolved during implementation:

- Should the user info in the top nav show just name, or name plus team/event?
- Should standings show only current rank, or also gap-to-next-team?
- Should the team leaderboard show all members or a capped list with scroll?
- Should the rules link open an internal page shell now, or remain a placeholder until content exists?
- How much OSRS-specific visual flavor should be present versus a cleaner competitive-app style?

## What Future Agents Should Preserve

If a future agent continues this work, preserve these assumptions unless the user explicitly changes them:

- authenticated player homepage first
- board remains visually dominant
- dark theme direction
- small top nav with user info, logout, and rules
- standings card with `My Team` and `Other Teams` split
- per-user points only for the player's own team

## Suggested Next Step

The next design step should be to translate this document into one or more concrete layout explorations for the authenticated player home before any broader visual system work.
