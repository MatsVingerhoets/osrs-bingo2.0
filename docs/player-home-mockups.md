# Player Home Mockups

These are low-fidelity layout mockups for the authenticated player homepage.

They are intentionally simple. The goal is to compare structure and visual direction before writing UI code.

## Shared Requirements

Both mockups preserve the current product assumptions:

- logged-in player homepage
- board is the main focal point
- compact top navigation
- standings card with `My Team` and `Other Teams`
- dark theme

---

## Mockup A: OSRS / Tactile / Atmospheric

### Summary

This direction leans more RuneScape-like and game-like.

Traits:

- heavier panel framing
- warmer dark palette
- more texture and ornament
- board feels like a physical game surface
- standings card feels like an in-world control panel

### Layout Sketch

```text
+----------------------------------------------------------------------------------+
| OSRS Bingo 2.0            Rules                      PlayerName  Team Ash  Logout |
+----------------------------------------------------------------------------------+

+--------------------------------------------------------+-------------------------+
|                                                        |                         |
|                  TEAM BOARD                            |      STANDINGS          |
|                                                        |  +-------------------+  |
|        ____    ____    ____    ____    ____            |  | My Team | Others |  |
|      /      \ /      \ /      \ /      \ /      \      |  +-------------------+  |
|      \  46  / \  57  / \  58  / \  ??  / \  ??  /      |                         |
|      /_____/ \_____/ \_____/ \_____/ \_____/           |  Team Ash              |
|         ____    ____    ____    ____    ____           |  Rank #2               |
|       /      \ /      \ /      \ /      \ /      \     |  184 pts               |
|       \  ??  / \  12  / \  28  / \  ??  / \  ??  /     |                         |
|       /_____/ \_____/ \_____/ \_____/ \_____/          |  Player leaderboard     |
|            ... more honeycomb board rows ...           |  1. Lynx       64 pts   |
|                                                        |  2. Mira       48 pts   |
|                                                        |  3. Dax        39 pts   |
|                                                        |  4. Sol        33 pts   |
|                                                        |                         |
|                                                        |  Rival teams            |
|                                                        |  Ember        201 pts   |
|                                                        |  Moss         177 pts   |
|                                                        |  Slate        143 pts   |
+--------------------------------------------------------+-------------------------+

                         [ Tile modal opens over board when selected ]
```

### Feel Notes

- background should feel like dim stone, parchment, brass, ember, or tavern light
- hexes can feel carved, enameled, or token-like
- nav should stay small even if surfaces are decorative
- ornament should frame the experience, not bury readability

### Best For

- stronger game identity
- more memorable personality
- players who want the app to feel closer to the OSRS event atmosphere

### Risks

- can get visually busy fast
- easier to make cheesy if overdone
- standings card must stay legible and not become “fantasy UI clutter”

---

## Mockup B: Competitive / Modern / Restrained

### Summary

This direction is cleaner and more tactical.

Traits:

- flatter dark surfaces
- sharper hierarchy
- less ornament
- board still dominates, but with cleaner framing
- standings card feels like esports or analytics UI

### Layout Sketch

```text
+----------------------------------------------------------------------------------+
| Event: Spring Bingo                      Rules                 PlayerName  Logout |
+----------------------------------------------------------------------------------+

+------------------------------------------------------------+---------------------+
|                                                            |  TEAM STATUS        |
|  TEAM ASH BOARD                                            |  Rank #2            |
|  184 pts                                                   |  184 pts            |
|                                                            |                     |
|   [ 46 ] [ 57 ] [ 58 ] [ ?? ] [ ?? ] [ ?? ]               |  [ My Team ] [ All ]|
|    [ ?? ] [ 12 ] [ 28 ] [ ?? ] [ ?? ] [ ?? ] [ ?? ]       |                     |
|     [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ]      |  Team roster        |
|      [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ]     |  Lynx       64      |
|       [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ]           |  Mira       48      |
|        [ ?? ] [ ?? ] [ ?? ] [ ?? ] [ ?? ]                 |  Dax        39      |
|                                                            |  Sol        33      |
|                                                            |                     |
|                                                            |  Other teams        |
|                                                            |  Ember      201     |
|                                                            |  Moss       177     |
|                                                            |  Slate      143     |
+------------------------------------------------------------+---------------------+

                    [ Tile detail / submit panel overlays from center or side ]
```

### Feel Notes

- background should be charcoal, muted bronze, slate, and low-saturation accent colors
- spacing and typography carry most of the polish
- card chrome should stay minimal
- tile states should pop through contrast, not decoration

### Best For

- cleaner and easier to scale
- more readable during long sessions
- lower risk of visual overload

### Risks

- may feel generic if not given enough identity
- needs careful typography and color choices to avoid looking bland

---

## Quick Comparison

### A feels like

- a game table
- a custom event interface
- more immersive and characterful

### B feels like

- a live competition console
- more disciplined and efficient
- easier to keep polished

---

## Recommendation

If the goal is strongest personality, start from `Mockup A` but keep the restraint of `Mockup B`.

In practical terms:

- use A for atmosphere, material palette, and board presence
- use B for spacing, information density, and standings clarity

That hybrid is probably the safest direction for this app.

## Next Step

Pick one of these:

1. `A mostly`
2. `B mostly`
3. `Hybrid: A atmosphere, B structure`

Once that is chosen, the next pass should be a coded first draft of the player homepage on the design branch.
