# GitHub Build And Deploy

This repo now includes a production image build path and a GitHub-driven deployment path aimed at a second Docker host or container that is reachable from the public internet.

Files added for this flow:

- [Dockerfile.prod](/app/Dockerfile.prod)
- [deploy/docker-compose.public.yml](/app/deploy/docker-compose.public.yml)
- [deploy/app.env.example](/app/deploy/app.env.example)
- [publish-image.yml](/app/.github/workflows/publish-image.yml)
- [deploy-public.yml](/app/.github/workflows/deploy-public.yml)

## What This Does

1. GitHub Actions builds a production image from this repo.
2. The image is pushed to GitHub Container Registry (`ghcr.io`).
3. A deploy workflow SSHes into the public target host or container.
4. The workflow uploads a compose file plus env files.
5. The target runs `docker compose pull` and `docker compose up -d`.

## Important Separation

The current repo `Dockerfile` is a development container. It is not suitable as the public runtime image.

Production now uses [Dockerfile.prod](/app/Dockerfile.prod), which:

- installs app dependencies
- builds the TanStack Start app
- installs production-only dependencies in the runtime image
- starts the app with `npm run start`

## GitHub Workflows

### Publish image

[publish-image.yml](/app/.github/workflows/publish-image.yml) runs on:

- pushes to `main`
- tags that start with `v`
- manual dispatch

It pushes these kinds of tags to GHCR:

- `latest` on the default branch
- branch tags
- git tag tags
- `sha-...` tags

### Deploy public container

[deploy-public.yml](/app/.github/workflows/deploy-public.yml) is manual by design.

It accepts:

- `image_tag`
- `public_port`

Default deploy target:

- `ghcr.io/<owner>/<repo>:latest`

## GitHub Secrets Required

Set these in the repository environment named `production`:

- `DEPLOY_HOST`: public hostname or IP of the target Docker host
- `DEPLOY_PORT`: SSH port, usually `22`
- `DEPLOY_USER`: SSH user on the target host
- `DEPLOY_PATH`: deployment directory on the target host, for example `/opt/osrs-bingo`
- `DEPLOY_SSH_KEY`: private SSH key used by GitHub Actions
- `GHCR_USERNAME`: GitHub username or machine user that can pull the package
- `GHCR_TOKEN`: token with permission to pull from GHCR
- `APP_ENV_FILE`: full contents of the production `app.env` file

`APP_ENV_FILE` should look like the example in [deploy/app.env.example](/app/deploy/app.env.example).

## Target Host Requirements

The public target needs:

- Docker Engine
- Docker Compose plugin
- outbound network access to `ghcr.io`
- network path to your database and Keycloak

If this target is a Docker LXC on Proxmox, verify:

- nested container support is enabled if needed for Docker
- the target has correct firewall/NAT rules
- the chosen public port is forwarded or exposed

## First-Time Setup

1. Push this repo to GitHub.
2. Enable GitHub Actions for the repo.
3. Ensure the package published to GHCR is pullable by the credentials you plan to use.
4. Create the `production` environment in GitHub.
5. Add the required secrets listed above.
6. Copy [deploy/app.env.example](/app/deploy/app.env.example) and fill in the real production values.
7. Put the full file contents into the `APP_ENV_FILE` secret.

## Deploy Flow

1. Push to `main` or manually run the publish workflow.
2. Confirm the image exists in GHCR.
3. Run the `Deploy Public Container` workflow.
4. Leave `image_tag=latest` unless you want to deploy a specific tag such as `sha-...`.
5. Set `public_port` to the port exposed on the public host.

## Runtime Notes

- The container listens on internal port `3000`.
- External exposure is controlled by `PUBLIC_PORT` in the deploy workflow.
- `APP_BASE_URL` and `VITE_APP_BASE_URL` must point at the real public URL.
- If the app is behind a reverse proxy, use the public HTTPS URL in those env vars.

## Recommended Next Step

If you want fully automatic production deployment after each successful `main` build, the current manual deploy workflow can be extended to trigger from image publish success. The manual version is safer while you validate the public host and runtime env.
