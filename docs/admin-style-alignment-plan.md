# Admin Style Alignment Plan

## Objective

Make the admin page look visually aligned with the homepage while preserving all existing admin behavior.

Constraints:

- Do not modify the homepage implementation.
- Do not change any admin page logic.
- Restrict changes to presentation only: class names, wrappers, layout treatment, and reusable style tokens.

## Current State

The homepage and admin page already share the same app stack and Tailwind setup, but they use different visual systems.

Homepage references:

- [Homepage route shell](/app/src/pages/index/IndexPage.tsx#L103)
- [Homepage top nav](/app/src/pages/index/components/TopNav.tsx#L42)
- [Homepage surface tokens](/app/src/pages/index/components/styles.ts#L1)
- [Homepage hero/content shell](/app/src/pages/index/components/BoardShell.tsx#L11)
- [Homepage status panel](/app/src/pages/index/components/StatusPanel.tsx#L11)

Admin references:

- [Admin page root and hero](/app/src/routes/admin.tsx#L255)
- [Draft creation and rules cards](/app/src/routes/admin.tsx#L295)
- [Per-event card shell](/app/src/routes/admin.tsx#L440)
- [Draft editing and readiness section](/app/src/routes/admin.tsx#L503)
- [Teams and assignments sections](/app/src/routes/admin.tsx#L599)
- [Completion inspection table](/app/src/routes/admin.tsx#L818)

## Key Visual Differences

The homepage uses a dark, high-contrast, glass-like interface with:

- Deep slate backgrounds
- Cyan accent color
- Translucent dark surfaces
- Compact chip-style controls
- White/slate typography hierarchy

The admin page currently uses a separate warm theme with:

- Cream and parchment backgrounds
- Brown and olive accents
- Large warm gradient cards
- Different badge and input styling
- Different heading treatment

## Styling Plan

### 1. Re-skin the admin page root

Update the admin root container to use the same dark radial-plus-linear background treatment as the homepage.

Implementation intent:

- Reuse the homepage page background language from [IndexPage.tsx](/app/src/pages/index/IndexPage.tsx#L103)
- Switch default admin text color to white/slate tones
- Preserve the current admin page structure and spacing behavior

### 2. Add a homepage-style top shell to admin

The admin page currently opens with a large warm hero panel. Replace that visual treatment with a compact, homepage-like top shell patterned after [TopNav.tsx](/app/src/pages/index/components/TopNav.tsx#L42).

Implementation intent:

- Use a dark translucent container
- Present role and board metadata as chips or compact metadata blocks
- Keep existing admin route links and auth data intact
- Limit changes to styling and visual composition

### 3. Standardize major admin sections onto homepage surface tokens

Multiple admin sections repeat nearly identical custom warm card styling:

- [Main hero card](/app/src/routes/admin.tsx#L257)
- [Create draft card](/app/src/routes/admin.tsx#L296)
- [Setup rules card](/app/src/routes/admin.tsx#L359)
- [Per-event container](/app/src/routes/admin.tsx#L440)

These should be restyled to match the homepage surface system defined in [styles.ts](/app/src/pages/index/components/styles.ts#L1).

Implementation intent:

- Use dark gradient surfaces for primary admin sections
- Use slightly lighter nested panels for secondary content
- Reuse a small set of style tokens rather than repeating large class strings

### 4. Align admin typography with homepage hierarchy

The homepage typography is more compact and controlled than the current admin page. The admin route should adopt the same hierarchy found in:

- [BoardShell.tsx](/app/src/pages/index/components/BoardShell.tsx#L11)
- [StatusPanel.tsx](/app/src/pages/index/components/StatusPanel.tsx#L11)

Implementation intent:

- Use cyan eyebrow labels for section headers
- Use white titles with tighter tracking
- Use slate body copy for supporting text
- Remove the warm hero-specific heading treatment currently used in [admin.tsx](/app/src/routes/admin.tsx#L263)

### 5. Convert admin controls to homepage-style form elements

Admin inputs, selects, and buttons currently use warm fills and brown borders in sections such as:

- [Create draft form](/app/src/routes/admin.tsx#L308)
- [Draft edit form](/app/src/routes/admin.tsx#L505)
- [Team reassignment controls](/app/src/routes/admin.tsx#L683)
- [Completion filter controls](/app/src/routes/admin.tsx#L834)

Implementation intent:

- Restyle inputs and selects with dark slate backgrounds
- Use subtle slate borders and high-contrast text
- Add cyan-focused interaction states
- Standardize button treatments by purpose

Button tiers:

- Primary: create, save, assign
- Secondary: move, neutral actions
- Danger: invalidate

### 6. Rework badges and metadata chips

Admin status pills and metadata chips currently use a separate parchment-like style, especially in:

- [Event status badge](/app/src/routes/admin.tsx#L450)
- [Board/version/start/duration chips](/app/src/routes/admin.tsx#L462)
- [Editable/read-only labels](/app/src/routes/admin.tsx#L610)
- [Submission count chip](/app/src/routes/admin.tsx#L829)

Implementation intent:

- Convert these into dark chip components
- Use homepage-like accent states for draft, active, completed, and archived
- Keep status meaning clear without introducing new behavior

### 7. Re-skin nested team and user cards

Nested records inside the team-management area should visually match the homepage rail panels rather than using white-on-cream blocks.

Targets:

- [Team cards](/app/src/routes/admin.tsx#L648)
- [Assigned member rows](/app/src/routes/admin.tsx#L670)
- [Unassigned user cards](/app/src/routes/admin.tsx#L762)

Implementation intent:

- Use darker nested surfaces
- Increase contrast for names, counts, and emails
- Keep the current layout and actions exactly as they are

### 8. Re-skin the completion inspection table

The completion inspection area should adopt the homepage’s denser, darker data presentation style instead of the current white row slabs.

Targets:

- [Completion section shell](/app/src/routes/admin.tsx#L818)
- [Filter controls](/app/src/routes/admin.tsx#L834)
- [Table rows and cells](/app/src/routes/admin.tsx#L939)
- [Proof link](/app/src/routes/admin.tsx#L987)
- [Invalidate action](/app/src/routes/admin.tsx#L998)

Implementation intent:

- Use dark row surfaces with consistent borders
- Improve contrast between headers, values, and helper text
- Style links and destructive actions to fit the homepage palette while preserving clarity
- Preserve current overflow behavior and table structure

## Suggested File Scope

Primary implementation target:

- [admin.tsx](/app/src/routes/admin.tsx)

Optional style reuse sources:

- [styles.ts](/app/src/pages/index/components/styles.ts)
- [TopNav.tsx](/app/src/pages/index/components/TopNav.tsx)

The preferred approach is to avoid modifying homepage behavior. If shared tokens are extracted, they should be done in a way that does not change the homepage output.

## Guardrails

- No homepage design changes
- No admin logic changes
- No route changes
- No loader or action changes
- No data shape changes
- No state management changes

Allowed changes:

- Tailwind class updates
- Visual wrappers
- Section composition adjustments
- Reusable presentational style constants

## Verification Checklist

- Admin page still renders all current sections and controls
- All forms submit exactly as before
- Event status transitions behave exactly as before
- Team assignment and team creation behave exactly as before
- Completion filtering behaves exactly as before
- Completion invalidation behaves exactly as before
- Mobile layout remains usable for filters, cards, and tables
- Dark theme contrast is acceptable for `input`, `select`, and `datetime-local`

## Expected Outcome

After implementation, the admin page should feel like part of the same product as the homepage:

- Same background language
- Same surface hierarchy
- Same typography system
- Same control and chip styling
- Same overall dark, glassy visual identity

The admin page should still behave exactly the same, with the work limited to styling.
