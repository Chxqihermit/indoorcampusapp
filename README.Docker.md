# Docker — CampusNav

Run the full stack (Laravel API + built React/Inertia frontend + MySQL) in **one app container**. There is no separate frontend container — Vite builds the UI into the image during `docker compose build`.

## Quick start (local)

```powershell
docker compose up --build
```

Open **http://localhost:8000**

Login after seed: `test@example.com` / `password`

## Test server deployment

1. Copy the project to the server (or pull a image you have built).
2. Create environment file from the template:

   ```bash
   cp .env.docker.example .env.docker
   ```

3. Edit `.env.docker`:
   - Set `APP_URL` to the server's public URL (e.g. `http://192.168.1.50:8000`)
   - Set strong `DOCKER_DB_PASSWORD` and `DOCKER_MYSQL_ROOT_PASSWORD`
   - Set `APP_ENV=production` and `APP_DEBUG=false`
   - Optionally set a unique `APP_KEY` (`php artisan key:generate --show`)

   Use the `DOCKER_*` database variable names — they avoid conflicting with `DB_*` in your local `.env` when Compose substitutes values.

4. Start detached:

   ```bash
   docker compose --env-file .env.docker up --build -d
   ```

5. Verify:

   ```bash
   docker compose ps
   docker compose logs -f app
   curl -f http://localhost:8000/up
   ```

### Fresh database on the server

If you need a clean DB (new migrations/seeders):

```bash
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker up --build -d
```

## Services

| Service | Default URL / port | Purpose |
|---------|-------------------|---------|
| **app** | `http://localhost:8000` | Laravel backend + Inertia/React frontend (same origin) |
| **db** | internal only (`db:3306`) | MySQL 8.4 — not exposed to the host by default |

To expose MySQL on the host for debugging, add under `db` in `docker-compose.yaml`:

```yaml
ports:
  - "3306:3306"
```

## Database credentials (defaults)

| Setting | Value |
|---------|--------|
| Host (from app container) | `db` |
| Database | `campusnav` |
| User | `campusnav` |
| Password | `campusnav` (change in `.env.docker` on test server) |

## First startup (automatic)

The app entrypoint will:

1. Wait for MySQL to be healthy
2. Use `APP_KEY` from compose / `.env.docker` (or generate if missing)
3. Run migrations
4. Run seeders:
   - Campus buildings from `public/data/nust-buildings.geojson`
   - Library indoor floors (building `D1`)
   - Indoor locations and paths
   - Faculty of Computing and Informatics staff from `database/seeders/data/fci-staff.json`

## Frontend + backend

This project uses **Inertia.js** — the React UI is served by Laravel from the same origin (`APP_URL`). API routes (`/api/*`) are on the same host, so map, search, and auth work without extra CORS setup.

## Health checks

- App: `GET /up` (Laravel health route)
- DB: `mysqladmin ping`

`docker compose ps` should show both services as **healthy** after startup.

## Useful commands

```powershell
docker compose up --build -d
docker compose logs -f app
docker compose down
docker compose down -v          # also deletes DB volume
```

## Local `.env` vs Docker

Docker injects environment variables via `docker-compose.yaml` and optional `.env.docker`. Your local `.env` is **not** copied into the image (see `.dockerignore`).

## PHP extensions

MySQL (`pdo_mysql`), GD, ZIP, and others are installed in the `Dockerfile`.
