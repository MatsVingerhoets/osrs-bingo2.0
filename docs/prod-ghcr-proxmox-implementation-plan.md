# Production Deployment Implementation Plan

## Purpose

This document converts the production deployment research into an execution plan for this repo.

Scope for this plan:

- GitHub Actions builds and publishes a private GHCR image on pushes to `main`
- the GitHub repo remains public
- deployment to the Proxmox LXC Docker host is manual
- production uses a separate env file and a separate PostgreSQL database
- no automatic SSH deploy from GitHub Actions

## Deployment Shape

The target production flow is:

1. push to `main`
2. GitHub Actions builds a production image
3. GitHub Actions pushes the image to `ghcr.io`
4. on the LXC host, manually run `docker compose pull`
5. on the LXC host, manually run `docker compose up -d`

## Planning Assumptions

- the Proxmox LXC already runs Docker reliably
- the LXC host has outbound access to `ghcr.io`
- the production PostgreSQL database already exists or will be provisioned separately
- Keycloak for production already exists or will be provisioned separately
- production secrets will not be committed to git

## Success Criteria

The implementation is complete when all of the following are true:

- pushing to `main` publishes a private image to GHCR
- the image can be pulled from the LXC host with a package-read credential
- the app runs from a dedicated production image, not the devcontainer image
- production env values live in a separate `app.env` file on the host
- the app connects to the production PostgreSQL database
- migrations can be run against production intentionally and separately

## Current Status

- Phase 1 is complete.
- Phase 2 is complete.
- Phase 3 is complete.
- Phase 4 is complete.
- The repo now builds the Node/Docker runtime through Nitro.
- Production starts with `npm run start`, which runs `.output/server/index.mjs`.
- The repo now includes a dedicated production image definition in `Dockerfile.prod`.
- The repo now includes a production-only env example in `deploy/app.env.example`.
- The repo now includes a GHCR publish workflow in `.github/workflows/publish-image.yml`.

## Phase 1: Production Runtime Definition

### Goal

Define how this app starts in production.

### Tasks

- confirm the TanStack Start production runtime entrypoint
- add a real `start` script to [`/app/package.json`](/app/package.json)
- verify what build artifacts are required at runtime
- confirm the runtime port and required env variables

### Dependencies

- none

### Acceptance Criteria

- `npm run build` produces the expected server/client output
- `npm run start` launches the production server locally
- the required runtime env surface is documented and validated

### Risks

- TanStack Start runtime output may differ from a plain Vite app
- a missing or incorrect start command will block container deployment

## Phase 2: Production Image

### Goal

Create a minimal production container image.

### Tasks

- add `Dockerfile.prod`
- use a multi-stage Node image build
- install dependencies with `npm ci`
- run `npm run build`
- copy only runtime artifacts into the final image
- expose port `3000`
- set `NODE_ENV=production`
- run `npm run start`

### Dependencies

- Phase 1

### Acceptance Criteria

- `docker build -f Dockerfile.prod .` succeeds
- the resulting image starts successfully with a valid production-like env file
- the image does not include devcontainer tooling

### Risks

- copying the wrong output directories will cause runtime boot failures
- runtime dependencies may be missing if production install is too aggressive

## Phase 3: Production Env Separation

### Goal

Separate production configuration from local development configuration.

### Tasks

- add `deploy/app.env.example`
- include only production app runtime variables in that example
- document the real host path for the production env file
- keep the real `app.env` file out of git
- verify `DATABASE_URL` points to the production database
- verify `APP_BASE_URL` and `VITE_APP_BASE_URL` use the real public URL

### Dependencies

- Phase 1

### Acceptance Criteria

- a committed production env example exists
- the host uses a separate uncommitted env file such as `/opt/osrs-bingo/app.env`
- production does not rely on the root project `.env`

### Risks

- copying dev-only variables into production can create confusion
- wrong public URL settings can break auth callbacks and generated links

## Phase 4: GHCR Publish Workflow

### Goal

Publish a private production image automatically on pushes to `main`.

### Tasks

- add `.github/workflows/publish-image.yml`
- trigger on pushes to `main`
- log in to `ghcr.io` with `GITHUB_TOKEN`
- build from `Dockerfile.prod`
- publish tags for `main` and `sha-*`
- add OCI metadata labels where useful

### Dependencies

- Phase 2

### Acceptance Criteria

- pushing to `main` creates or updates the GHCR package
- the package remains private
- the workflow can be re-run safely
- a specific commit image can be identified by `sha-*` tag

### Risks

- package access inheritance can accidentally make pulls broader than intended
- failed builds on `main` will block image publication

## Phase 5: GHCR Access Control

### Goal

Make the image pullable only by the intended production identity.

### Tasks

- publish the package once
- inspect the package settings in GHCR
- confirm package visibility is `private`
- review whether repository permission inheritance is enabled
- remove inherited access if it would expose pulls too broadly
- create or choose a dedicated GitHub identity for the LXC host
- create a token with `read:packages`

### Dependencies

- Phase 4

### Acceptance Criteria

- anonymous pulls fail
- pulls succeed only with the intended credential
- the public repository does not imply public image access

### Risks

- inherited package permissions are easy to miss
- using a personal admin token on the host is unnecessary and risky

## Phase 6: Host Deployment Files

### Goal

Prepare the LXC host to run the app from GHCR.

### Tasks

- create `/opt/osrs-bingo/`
- place `app.env` in that directory
- create a host-side `docker-compose.yml`
- reference the GHCR image tag to deploy
- load env from `./app.env`
- map the desired host port to container port `3000`
- set `restart: unless-stopped`

### Dependencies

- Phase 2
- Phase 3
- Phase 5

### Acceptance Criteria

- `docker compose config` succeeds on the host
- the compose file starts the app image with the expected env values
- changing the image tag is straightforward for rollback or promotion

### Risks

- host file paths and ownership can block deployment
- direct port exposure may be wrong if a reverse proxy is expected

## Phase 7: Database Migration Procedure

### Goal

Define a safe manual migration flow for production.

### Tasks

- decide whether migrations run from the app image or a local repo checkout
- document the exact migration command for production
- verify migrations target the production `DATABASE_URL`
- run migrations before or during the first deployment
- document rollback expectations if a migration fails

### Dependencies

- Phase 3

### Acceptance Criteria

- there is one documented migration procedure for production
- migrations are not hidden inside app startup
- production DB changes happen intentionally and can be observed

### Risks

- running migrations automatically on app boot makes failures harder to control
- schema drift between app image and database state can block startup

## Phase 8: Manual Deployment Procedure

### Goal

Define the exact manual steps to update production after a new image is published.

### Tasks

- document `docker login ghcr.io` for the host
- document `docker compose pull`
- document `docker compose up -d`
- document how to verify the running image tag
- document log and health-check commands
- document rollback by pinning a prior `sha-*` image tag

### Dependencies

- Phase 6

### Acceptance Criteria

- the deployment operator can update production without editing code
- rollback to a prior image tag is documented and practical
- the procedure is short enough to use reliably under pressure

### Risks

- using only a moving tag like `main` makes rollback weaker
- skipping verification after `up -d` can hide startup failures

## Recommended Host Commands

First-time login:

```bash
echo '<GHCR_TOKEN>' | docker login ghcr.io -u '<GHCR_USERNAME>' --password-stdin
```

Normal deploy:

```bash
cd /opt/osrs-bingo
docker compose pull
docker compose up -d
docker compose logs --tail=200 app
```

Rollback example:

```bash
cd /opt/osrs-bingo
# edit docker-compose.yml to pin a prior sha-* tag
docker compose pull
docker compose up -d
```

## Deliverables

Implementation should produce at least these artifacts:

- `Dockerfile.prod`
- `.github/workflows/publish-image.yml`
- `deploy/app.env.example`
- a documented host-side `docker-compose.yml`
- a documented production migration procedure
- a documented manual deployment and rollback procedure

## Recommended Execution Order

1. implement and verify the production `start` command
2. add and validate `Dockerfile.prod`
3. add `deploy/app.env.example`
4. add the GHCR publish workflow
5. publish one test image from `main`
6. lock down GHCR package access
7. prepare the LXC host files and credentials
8. run production migrations
9. manually pull and start the image on the LXC host
10. verify app boot, auth, and database connectivity

## Out Of Scope

This plan does not include:

- SSH-based deployment from GitHub Actions
- auto-deploy on publish
- infrastructure provisioning for PostgreSQL
- infrastructure provisioning for Keycloak
- reverse proxy or TLS setup unless it is required for the app to be reachable
