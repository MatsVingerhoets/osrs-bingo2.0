
# Devcontainer Scaffold

A starter scaffolding repo for greenfield projects. It ships a VS Code Dev Container backed by Docker Compose, a PostgreSQL service, and optional dotfile mounts so you can get coding quickly with a consistent toolchain.

## What You Get
- Ubuntu 22.04 base with Node.js 24, Git, Ripgrep, fd, tmux, fzf, and Neovim preinstalled.
- Runs as root inside the devcontainer (no non-root user created).
- PostgreSQL service (version configurable) plus `dbmate` helper container.
- Dotfile mounts for SSH keys, Zsh, Neovim, and Git config (default to your host paths).
- Workspace folder inside the container set by `APP_DIR` (default `app`).

## Prerequisites
- Docker + Docker Compose
- VS Code with the Dev Containers extension (or `devcontainer` CLI)
- (Optional) Your dotfiles on the host so the mounts have something to bind

## Required & Optional Environment Variables
Copy `.env.example` to `.env` and adjust. Key variables:

| Variable | Required | Description |
| --- | --- | --- |
| `APP_DIR` | Yes | Folder name used as the workspace inside the container (e.g., `app`). |
| `APP_PORT` | Yes | Host port mapped to the app container’s port 3000. Must be free on your host. |
| `POSTGRES_VERSION` | Yes | PostgreSQL image tag (e.g., `17`). |
| `DB_USER` | Yes | Postgres username. |
| `DB_PASSWORD` | Yes | Postgres password. Leave blank only if you accept trust auth locally. |
| `DB_NAME` | Yes | Database name created at startup. |
| `DB_PORT` | Yes | Host port for Postgres (unique per project if you run multiple). |
| `POSTGRES_HOST_AUTH_METHOD` | Yes | Auth mode; defaults to `trust` for local dev. |
| `SSH_PATH` | Yes | Host path to `.ssh` (defaults to `${HOME}/.ssh`). Must exist for SSH to work in the container. |
| `ZSHRC_PATH` | Yes | Host path to `.zshrc` (defaults to `${HOME}/.zshrc`). Required because the container shells into zsh. |
| `NEOVIM_CONFIG_PATH` | Yes | Host path to Neovim config (defaults to `${HOME}/.config/nvim`). |
| `GITCONFIG_PATH` | Optional | Host path to `.gitconfig` (defaults to `${HOME}/.gitconfig`). |
| `PGADMIN_*` | Optional | Uncomment in `.env` and `docker-compose.yml` if you enable pgAdmin service. |

## Start a New Project from Scratch
1) Create a new repository from this scaffold on GitHub (Use this template).
2) Clone your new repo locally: `git clone <your-repo-url>`.
3) Copy the example env file and edit values: `cp .env.example .env`; set `APP_DIR`, `APP_PORT`, and DB values. Ensure host ports (`APP_PORT`, `DB_PORT`) are free.
4) Create the workspace folder that matches `APP_DIR` (e.g., `mkdir app`) and add your application code there.
5) Open the folder in VS Code and select “Reopen in Container” (or run `devcontainer up --workspace-folder .`).
6) Once the container is up, your shell is inside `/APP_DIR` and PostgreSQL is running on `localhost:DB_PORT`.

## Usage Notes
- To start services manually without VS Code: `docker compose up` (uses `docker-compose.yml`).
- Database URL inside the dev network: `postgres://<DB_USER>:<DB_PASSWORD>@postgres:5432/<DB_NAME>?sslmode=disable`.
- The `dbmate` service runs `dbmate up` on start; add migrations under a location recognized by dbmate (defaults to `/app/db/migrations`) or disable the service if unused.
- Dotfile mounts (`SSH_PATH`, `ZSHRC_PATH`, `NEOVIM_CONFIG_PATH`, `GITCONFIG_PATH`) default to your host paths; ensure those files/dirs exist so zsh/SSH/Neovim and git work in the container.
- To enable per-project pgAdmin, uncomment the `pgadmin` service in `docker-compose.yml` and set `PGADMIN_*` vars plus an open `PGADMIN_PORT`.
