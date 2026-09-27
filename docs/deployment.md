# Docker & Deployment

The app ships with multi-stage Dockerfiles for both frontend and backend and a `docker-compose.yml` that brings up the entire stack locally.

## Services

| Service  | Image base                  | Port (default) | Purpose                       |
|----------|------------------------------|----------------|-------------------------------|
| mysql    | mysql:8.0                    | 3306           | Database                      |
| backend  | node:20-alpine (multi-stage) | 4000           | Express + Prisma API          |
| frontend | nginx:1.27-alpine            | 80             | Static React build + nginx    |

## Quick start

```bash
cp .env.example .env
# Edit .env — set MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD, JWT_SECRET, CORS_ORIGIN
docker compose up -d --build
```

After the first start:

```bash
# Seed the database with sample users + projects + tasks
docker compose exec backend npx tsx prisma/seed.ts
```

Then open:
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api
- Swagger UI: http://localhost:4000/api/docs

Default seeded user: `admin@example.com / Admin@123`.

## Database Migrations

In production, the backend container runs `npx prisma migrate deploy` before starting. To create a new migration locally:

```bash
cd backend
npx prisma migrate dev --name <migration_name>
```

Then rebuild the backend image:

```bash
docker compose build backend
docker compose up -d backend
```

## Production Checklist

- [ ] `JWT_SECRET` is at least 32 random characters.
- [ ] `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` are strong.
- [ ] `CORS_ORIGIN` lists the real public frontend origin (no wildcards).
- [ ] HTTPS termination is set up at the reverse-proxy / load-balancer.
- [ ] Backups: snapshot the `mysql_data` volume nightly.
- [ ] Logs: aggregated (e.g., Loki, Datadog).
- [ ] Monitoring: `/health` endpoint scraped by uptime checker.

## Behind a Reverse Proxy (recommended)

If you put Nginx / Traefik / Caddy in front of the stack:

- Frontend container serves the SPA from port 80.
- API calls (`/api/*`) are proxied to the backend container on 4000.
- Set `VITE_API_BASE_URL=/api` so the frontend uses the same origin.

Example Caddy snippet:

```caddyfile
api.example.com {
    reverse_proxy backend:4000
}
app.example.com {
    reverse_proxy frontend:80
}
```
