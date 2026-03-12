# Implementing Functionality Design Plan

## Purpose

This document breaks the remaining implementation work into phases where each phase ends with a completed, usable feature. The goal is to connect the approved player-home design to the existing live functionality without losing working gameplay behavior during the transition.

## Planning Principles

- each phase should end in a shippable vertical slice
- prefer wiring existing live functionality before introducing new behavior
- keep the board as the primary player-facing surface
- add new server-side data only where the design requires information the app does not currently expose
- preserve existing gameplay correctness while redesigning the page shell

## Phase 1: Live Player Home Shell

### Completed Feature

The real `/` route renders the new dark player-home layout using live event, team, and board data.

### Scope

- replace the current Phase 7 homepage shell on `/`
- refactor the prototype layout components into reusable presentational components with typed props
- wire the existing current-event loader data into the new shell
- preserve existing empty states for:
  - unauthenticated users
  - no active event
  - active event with no assigned team
- preserve existing tile selection and tile panel behavior

### Acceptance Criteria

- signed-in players see the redesigned homepage on `/`
- current event name, current team name, and board metrics are live
- the board still loads from runtime data
- empty states still render correctly

## Phase 2: Team Context Rail

### Completed Feature

The right rail shows accurate live data for the player’s own team.

### Scope

- replace placeholder team summary content with real values
- expose the player team’s score, completed count, visible or unlocked counts, and board status
- enrich contribution data so the UI shows player names instead of raw user IDs
- rework the existing contribution and recent-completion sections into the new right-rail structure

### Acceptance Criteria

- the side rail no longer contains hardcoded prototype content
- the player can see a live team summary
- the roster contribution list shows teammate display names and scores
- the page still refreshes correctly after a submission

## Phase 3: Event Standings

### Completed Feature

Players can see their team’s rank and compare against other teams in the active event.

### Scope

- add repository and server-side read paths for event-wide standings
- compute total score per team for the active event
- determine the current team rank
- expose other team totals for comparison
- optionally compute score gap to the next team above or below

### Acceptance Criteria

- the homepage displays current team rank
- the homepage displays other team totals for the active event
- standings are derived from live completion data
- standings remain consistent after tile submissions and invalidations

## Phase 4: Standings Tabs And Competitive Context

### Completed Feature

The right rail behaves like a polished competitive dashboard with real tabbed views.

### Scope

- implement the `My Team` and `Other Teams` tab interaction
- ensure the default tab emphasizes the player’s own team
- make the standings area work cleanly on mobile and desktop
- decide where recent completions belong in the redesigned rail

### Acceptance Criteria

- players can switch between team and rival standings views
- the standings area remains readable across screen sizes
- the board remains visually dominant while standings stay accessible

## Phase 5: Board Visual Parity

### Completed Feature

The live interactive board matches the approved design direction while preserving current gameplay behavior.

### Scope

- restyle or replace the current player board renderer using the existing live board data contract
- preserve hidden, unlocked, and completed tile states
- preserve click behavior for opening tiles
- preserve score and board-state updates after submissions
- align tile styling, spacing, framing, and surrounding shell with the approved design

### Acceptance Criteria

- the board visually matches the new player-home design language
- all current board interactions still work
- hidden, unlocked, and completed states remain clearly distinct

## Phase 6: Submission Panel Redesign

### Completed Feature

Submitting proof and inspecting completed tiles feels native to the new design system.

### Scope

- restyle the tile panel for the darker player-home shell
- preserve the existing submission workflow and server validation
- improve loading, error, and completed-state presentation where needed

### Acceptance Criteria

- players can submit proof from the redesigned panel
- completed tiles still show proof and attribution details
- error and loading states remain clear

## Phase 7: Rules Route And Final Nav Wiring

### Completed Feature

Every top-nav element on the player homepage routes to a real destination.

### Scope

- create a `/rules` route
- connect the player-home nav to the new route
- ensure the nav supports rules, logout, player identity, and optional admin access
- remove remaining placeholder navigation targets

### Acceptance Criteria

- the rules link is real
- logout remains functional
- admin users still have a clear path to admin tooling

## Phase 8: Hardening And Verification

### Completed Feature

The redesigned player homepage is verified and stable enough to ship.

### Scope

- add tests for standings derivation and contribution display mapping
- verify empty states and submission flow do not regress
- run lint, typecheck, and relevant automated tests
- verify desktop and mobile behavior

### Acceptance Criteria

- the redesigned homepage passes validation checks
- critical gameplay flows are covered by tests or verification steps
- responsive behavior is acceptable on supported screen sizes

## Recommended Delivery Order

1. Phase 1: Live Player Home Shell
2. Phase 2: Team Context Rail
3. Phase 3: Event Standings
4. Phase 5: Board Visual Parity
5. Phase 6: Submission Panel Redesign
6. Phase 4: Standings Tabs And Competitive Context
7. Phase 7: Rules Route And Final Nav Wiring
8. Phase 8: Hardening And Verification

## Notes

- phases are organized around completed features rather than internal code layers
- the fastest path to visible progress is to move the live `/` route onto the new shell first
- standings work is the main missing server-side functionality required by the approved design
- the current gameplay flow already exists, so most early work is wiring and data shaping rather than new game-rule implementation
