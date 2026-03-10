Database integration code lives here.

Current Phase 3 scope:

- Kysely database client setup
- migration runner and initial schema migrations
- shared database table typings

Feature-specific repositories should stay near their feature modules and import the shared client/schema from this folder.
