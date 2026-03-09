# Phase 2 Research Tracker

This document captures the implementation decisions that need to be settled before writing Phase 2 authentication and session code.

## Working Method

- resolve questions in dependency order
- ask the user one question at a time
- record the chosen answer here before moving to the next question
- keep the scope implementation-oriented rather than exploratory

## Status

- current focus: `phase-2-implementation-checklist`
- blocked on user input: no
- code implementation started: no

## Decision Log

### Q1. Which Keycloak claim should map to the local `username` field?

Status: decided

Current recommendation:
- use `preferred_username` as the primary source for local `username`

Reason:
- it is the most common stable Keycloak username-style claim
- it separates login identity from display-friendly profile fields

Open choices to confirm:
- `preferred_username`
- `username`
- another custom claim

Decision:
- keep a separate local `keycloakId`, `username`, and `email`
- map local `username` from a dedicated Keycloak username-style claim rather than overloading `sub` or `email`

Notes:
- this choice affects first-login provisioning and later profile sync rules
- implementation default: `KEYCLOAK_USERNAME_CLAIM=preferred_username`
- if that claim is missing, fall back to `preferred_username`, then `username`, then the email local-part

### Q2. Which Keycloak claim should map to the local `display_name` field?

Status: decided

Decision:
- do not add a separate local `display_name` field in Phase 2
- use `username` as the user-facing display value for now

### Q3. Which Keycloak claim should map to the local `email` field?

Status: decided

Decision:
- map local `email` directly from Keycloak's `email` claim

### Q4. Which role source should the app read from Keycloak?

Status: decided

Decision:
- read app authorization roles from Keycloak client roles only

Notes:
- do not read realm roles in Phase 2

### Identity Mapping Summary

Status: decided

Decision:
- local `keycloakId` maps from Keycloak `sub`
- local `username` stays separate from `keycloakId` and `email`
- local `email` maps from Keycloak `email`
- no separate `display_name` in Phase 2

### Q5. What should the default role behavior be when no mapped role is present?

Status: decided

Decision:
- if no mapped client role is present, default the local app roles array to `['USER']`

### Q5a. If both `osrs_bingo_admin` and `osrs_bingo_user` are present, which one wins?

Status: decided

Decision:
- do not collapse roles to a single winner
- store mapped app roles on the local user model as an array
- if both `osrs_bingo_admin` and `osrs_bingo_user` are present, persist both mapped app roles

Notes:
- this supersedes the earlier single-role assumption in the planning docs
- Phase 2 implementation should use role-membership checks instead of single-role equality checks

### Q6. Which OIDC integration approach should we use in TanStack Start?

Status: decided

Decision:
- use `openid-client` as the Phase 2 OIDC library

Notes:
- keep OIDC protocol handling in `openid-client`
- keep local session persistence and local user provisioning in app-owned code

### Q7. What local session model should Phase 2 use?

Status: decided

Decision:
- use a cookie-only local session after successful login
- do not introduce a database-backed session table in Phase 2

Notes:
- this includes cookie shape, storage strategy, and expiry basics

### Q7a. What should the cookie session contain?

Status: decided

Decision:
- store the local user id and the local roles array in the cookie session

Notes:
- do not require a database read just to answer simple authenticated role checks

### Q8. What fields should be synced on first login vs subsequent logins?

Status: decided

Decision:
- on first login, create the local user from Keycloak identity data
- on later logins, resync roles from Keycloak
- do not resync `username` or `email` after the local user has been created

Notes:
- Phase 2 may assume `username` and `email` remain stable after provisioning

### Q9. What should logout do in Phase 2?

Status: decided

Decision:
- clear the local app session cookie
- perform Keycloak logout as part of the logout flow
- if Keycloak logout fails, the local session must still be destroyed

### Q10. Which routes need auth-only and admin-only protection in the first auth pass?

Status: decided

Decision:
- all app routes require authentication
- unauthenticated users should be redirected into the login flow
- `/admin` should require the `ADMIN` role in the first auth pass

Notes:
- the app is private by default in Phase 2

## Phase 2 Implementation Checklist

### 1. Finalize environment contract

- add `KEYCLOAK_ISSUER_URL`
- add `KEYCLOAK_CLIENT_ID`
- add `KEYCLOAK_CLIENT_SECRET`
- add `SESSION_SECRET`
- document which values are required for boot vs required for auth usage

### 2. Add auth library and integration surface

- install `openid-client`
- add a dedicated auth integration area under `src/features/auth`
- add a dedicated Keycloak/OIDC helper area under `src/lib/keycloak`
- centralize OIDC discovery and client configuration

### 3. Define the local auth model

- use Keycloak `sub` as local `keycloakId`
- use Keycloak `email` as local `email`
- use a username-style Keycloak claim for local `username`
- do not add `display_name` in Phase 2
- store app roles as a local string array

### 4. Implement login flow

- add a login entry route or server function
- redirect unauthenticated users into Keycloak login
- generate and validate `state` and `nonce`
- exchange the authorization code through `openid-client`

### 5. Implement callback handling

- resolve claims from the callback token set
- extract client roles only
- map client roles to app roles
- default to `['USER']` when no mapped role is present
- provision a local user on first successful login
- on later logins, resync roles only

### 6. Implement app-owned cookie session

- create a signed or encrypted cookie session
- store local user id and roles array in the session
- define session lifetime and cookie flags
- add helpers to read and clear the session

### 7. Implement route protection

- treat the app as private by default
- redirect unauthenticated users to login
- add an admin guard for `/admin`
- use role-membership checks rather than single-role equality checks

### 8. Implement logout flow

- destroy the local session
- redirect through Keycloak logout
- ensure local logout still succeeds if Keycloak logout fails

### 9. Verify Phase 2 behavior

- verify first login creates a local user
- verify repeat login updates roles only
- verify no-role users receive `['USER']`
- verify `/admin` rejects non-admin users
- verify app-wide auth redirect behavior
- verify logout clears the local session

## Planning Corrections

- earlier planning docs assumed a single local `role`; Phase 2 should use a local `roles` array instead
- earlier planning docs mentioned `display_name`; Phase 2 should not include that field
- earlier planning docs left the `username` source claim open; implementation now defaults to `KEYCLOAK_USERNAME_CLAIM=preferred_username`

## Phase 2 Implementation Notes

- local user persistence is temporarily file-backed in `.data/auth-users.json`
- this repository is an implementation bridge so Phase 2 can proceed before the Kysely/Postgres layer in Phase 3
- Phase 3 should replace the file-backed user repository with the real database repository without changing the auth/session interfaces
