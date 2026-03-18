# Production Deployment Research: GHCR + Proxmox LXC

Date: 2026-03-18

## Scope

This document covers a production deployment path for this app with these requirements:

- GitHub Actions builds and publishes a container image on every push to `main`
- the source repo stays public
- the GHCR image stays private
- a Docker host running inside a Proxmox LXC pulls the image and runs it live
- production uses a separate env file and a different PostgreSQL database than development

## Repo Findings

The current repo is not production-ready yet, but it is close enough to define the deployment shape.

- [`/app/Dockerfile`](/app/Dockerfile) is a developer workstation/devcontainer image, not an app runtime image.
- [`/app/docker-compose.yml`](/app/docker-compose.yml) is for local development and mounts the repo into the container.
- [`/app/package.json`](/app/package.json) has `build`, `preview`, and `db:migrate`, but no explicit production `start` script right now.
- [`/app/src/lib/env/server.ts`](/app/src/lib/env/server.ts) confirms the runtime env surface the deployed container will need.
- [`/app/.env.example`](/app/.env.example) mixes local dev container settings and app settings, so production should use a separate file.

## Recommended Architecture

Use four separate concerns instead of trying to reuse the dev setup:

1. A dedicated production Dockerfile.
2. A GitHub Actions workflow that publishes a private image to GHCR on `main`.
3. A production-only env file stored outside the repo on the LXC host.
4. A deployment compose file on the LXC host that pulls from GHCR and restarts the app.

Recommended runtime topology:

- GitHub Actions builds `ghcr.io/<owner>/<repo>:main` and `ghcr.io/<owner>/<repo>:sha-<commit>`
- the Proxmox LXC host runs Docker Engine + Docker Compose
- the LXC host keeps `/opt/osrs-bingo/app.env` with production secrets
- the app container connects to a separate production PostgreSQL instance
- the app is exposed either directly on a host port or behind a reverse proxy

## Why GHCR Works For A Public Repo With A Private Image

This setup is supported by GitHub.

- GitHub Container Registry supports granular permissions for container packages.
- Package visibility is separate from repository visibility.
- Container packages are private by default when first published.

That means you can keep the repo public while keeping the image private.

Important nuance:

- If the package is linked to the repository before first publish, it inherits repository access permissions by default, though not repository visibility.
- Because your repo is public, inherited read access would make the image broadly readable.

Recommended handling:

- publish the package privately
- then check the package settings in GHCR and remove inherited access if needed
- keep package visibility `private`
- grant read access only to the identity you will use from the LXC host

This is the main policy detail to get right.

## Recommended Production Files

These are the files I would create during implementation:

- `Dockerfile.prod`
- `.github/workflows/publish-image.yml`
- `deploy/docker-compose.prod.yml`
- `deploy/app.env.example`

Keep the real production env file out of git:

- actual host file: `/opt/osrs-bingo/app.env`
- committed example: `deploy/app.env.example`

## Production Env File

Production should not reuse the current root `.env`.

Recommended production env keys for this app:

```dotenv
NODE_ENV=production
PORT=3000

APP_NAME=OSRS Bingo 2.0
APP_BASE_URL=https://your-domain.example
VITE_APP_NAME=OSRS Bingo 2.0
VITE_APP_BASE_URL=https://your-domain.example

DATABASE_URL=postgres://prod_user:prod_password@prod-postgres-host:5432/osrs_bingo_prod
SESSION_SECRET=replace-with-a-long-random-secret
SESSION_MAX_AGE_SECONDS=28800

KEYCLOAK_ISSUER_URL=https://keycloak.example.com/realms/osrs-bingo
KEYCLOAK_CLIENT_ID=osrs-bingo-web
KEYCLOAK_CLIENT_SECRET=replace-with-real-secret
KEYCLOAK_USERNAME_CLAIM=preferred_username
```

Notes:

- `DATABASE_URL` must point to the production database, not the dev container database.
- `APP_BASE_URL` and `VITE_APP_BASE_URL` must use the real public URL.
- `SESSION_SECRET` must be long and random.
- If PostgreSQL is remote, verify firewall and routing from the LXC host.

## Recommended Release Flow

### Option A: Publish On `main`, Deploy Manually

This is the safest first production step.

Flow:

1. push to `main`
2. GitHub Actions builds and pushes the image to GHCR
3. on the LXC host, run `docker compose pull && docker compose up -d`

Pros:

- simplest to debug
- fewer secrets in GitHub Actions
- lower blast radius while production is new

Cons:

- not fully hands-off

### Option B: Publish On `main`, Then Auto-Deploy Over SSH

This is the best match for "push to main and get it live".

Flow:

1. push to `main`
2. GitHub Actions publishes the new private image
3. a second job SSHes into the LXC host
4. the host runs `docker login ghcr.io`, `docker compose pull`, and `docker compose up -d`

Pros:

- fully automatic
- no polling on the host

Cons:

- requires SSH access from GitHub Actions to the host
- requires careful secret handling

Recommendation:

- start with Option A for the first production cut
- move to Option B once the image, env file, and DB wiring are stable

## Recommended GHCR Publish Workflow

Use a workflow triggered by pushes to `main`.

Recommended job permissions:

- `contents: read`
- `packages: write`

Optional, if you want provenance/attestations:

- `attestations: write`
- `id-token: write`

Recommended tags:

- `main`
- `sha-<full-or-short-commit>`
- optionally `latest`

I would keep both `main` and `sha-*` tags:

- `main` gives you a simple moving target
- `sha-*` gives you rollback and auditability

Recommended publish steps:

```yaml
name: Publish Image

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v5

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=main
            type=sha,prefix=sha-

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile.prod
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

## Recommended Production Image Shape

Use a separate `Dockerfile.prod` with a multi-stage Node build.

Requirements for this repo:

- install dependencies with `npm ci`
- run `npm run build`
- copy only runtime artifacts into the final image
- expose port `3000`
- run an explicit production start command

This repo now uses the TanStack Start Nitro adapter for the Node/Docker path and starts production with:

- `npm run start`
- runtime entrypoint: `.output/server/index.mjs`

## Recommended LXC Host Deployment

Use a deployment directory on the Docker LXC host, for example:

```text
/opt/osrs-bingo/
  docker-compose.yml
  app.env
```

Suggested compose shape:

```yaml
services:
  app:
    image: ghcr.io/<owner>/<repo>:main
    restart: unless-stopped
    env_file:
      - ./app.env
    ports:
      - "3000:3000"
```

If you want the app updated automatically from GitHub Actions, the remote deploy step should run:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
docker compose pull
docker compose up -d
```

I recommend authenticating on the host with a dedicated low-privilege credential that only needs `read:packages`.

## Authentication For Pulling The Private Image

For the LXC host, use a GitHub personal access token (classic) with:

- `read:packages`

Store it on the host or pass it during a GitHub Actions deploy job.

Do not use a broad personal token if a dedicated machine user is practical.

## Database And Migration Strategy

The app already has a migration command:

- [`/app/src/lib/db/migrate.ts`](/app/src/lib/db/migrate.ts)
- script: `npm run db:migrate`

Recommended production behavior:

- run migrations against the production `DATABASE_URL`
- do this before switching traffic to a new image

Operationally, there are two reasonable patterns:

- run migrations inside the app image as a separate one-off container
- run migrations in the deploy workflow before `docker compose up -d`

I would not hide migrations inside container startup. It makes rollback and failure handling worse.

## Proxmox LXC Considerations

This part is partly an inference from how Docker behaves inside LXC rather than a GHCR rule.

- Docker-in-LXC can work, but it is more fragile than Docker on a full VM.
- networking, iptables/nftables, overlay storage, and kernel feature exposure are the usual failure points.
- if this host is already running Docker reliably, using it for this app is reasonable
- if you see recurring kernel or storage-driver issues, move the Docker host to a VM instead of fighting the LXC

## Recommended Implementation Order

1. add `Dockerfile.prod`
2. add a real production `start` script
3. add `deploy/app.env.example`
4. add `.github/workflows/publish-image.yml`
5. publish once to GHCR
6. verify the package is still private and remove inherited access if needed
7. create `/opt/osrs-bingo/app.env` on the LXC host
8. create `/opt/osrs-bingo/docker-compose.yml` on the LXC host
9. authenticate the host to `ghcr.io`
10. test `docker compose pull && docker compose up -d`
11. add optional SSH-based auto-deploy after publish

## Final Recommendation

Yes, this deployment model is viable.

The cleanest version for this repo is:

- public GitHub repo
- private GHCR image
- separate production image and compose file
- separate production env file on the LXC host
- separate production PostgreSQL database
- push to `main` publishes the image
- optional second step auto-deploys it to the Proxmox LXC host over SSH

The remaining implementation work is now centered on the production image, GHCR workflow, env separation, and host deployment files.

## Sources

- GitHub Docs, "Working with the Container registry": https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- GitHub Docs, "Configuring a package's access control and visibility": https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility
- GitHub Docs, "Publish Docker images": https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- Docker Docs, "`docker login`": https://docs.docker.com/reference/cli/docker/login/
