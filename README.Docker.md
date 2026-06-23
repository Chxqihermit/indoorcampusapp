# Docker — CampusNav

Run the full stack (Laravel + built React/Inertia frontend + MySQL):

```powershell
docker compose up --build
```

Open **http://localhost:8000**

Login after seed: `test@example.com` / `password`

## Services

| Service | URL / port | Purpose |
|---------|------------|---------|
| **app** | http://localhost:8000 | Laravel serves the API and Inertia frontend |
| **db** | localhost:3306 | MySQL 8.4 |

Database credentials (Docker):

| Setting | Value |
|---------|--------|
| Host (from your PC) | `127.0.0.1` |
| Host (from app container) | `db` |
| Database | `campusnav` |
| User | `campusnav` |
| Password | `campusnav` |
| Root password | `root` |

## How frontend + backend connect

This project uses **Inertia.js** — the React UI is served by Laravel from the same origin (`http://localhost:8000`). Vite assets are **built into the image** during `docker compose build`, so no separate frontend container is required.

API routes (`/api/*`) are on the same host, so the map, search, and auth work without CORS configuration.

## First run

On startup the app container will:

1. Wait for MySQL to be healthy
2. Generate `APP_KEY` if needed
3. Run migrations
4. Run seeders

Staff directory data is not seeded — import your `staffdirectory` table separately if needed.

## Useful commands

```powershell
docker compose up --build -d      # detached
docker compose logs -f app        # app logs
docker compose down               # stop
docker compose down -v            # stop and delete DB volume
```

## Local `.env` vs Docker

Docker injects environment variables in `docker-compose.yaml`. Your local `.env` is not used inside the container (and is excluded from the image via `.dockerignore`).

## PHP extensions

MySQL (`pdo_mysql`), GD, ZIP, and others are installed in the Dockerfile. Add more in `Dockerfile` if needed.
