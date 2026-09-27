# Deployment Runbook

Step-by-step guide to deploy the Task Management System to production.

## Production Architecture

```
                  Internet
                     |
                     ▼
              ┌──────────────┐
              │   HTTPS /    │
              │  Reverse     │
              │  Proxy       │
              │  (Caddy /    │
              │   Nginx)     │
              └──────┬───────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 ┌────────────┐            ┌────────────┐
 │ Frontend   │            │ Backend    │
 │ (nginx)    │  ─── API ──▶  (Node.js │
 │ SPA build  │            │  + Prisma) │
 └────────────┘            └──────┬─────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │   MySQL 8    │
                          │   (managed)  │
                          └──────────────┘
```

## Deployment Checklist

### Pre-deployment

- [ ] All tests pass on CI (`backend-lint-test`, `frontend-lint-test-build`).
- [ ] Docker images built successfully on CI.
- [ ] `JWT_SECRET` is at least 32 random characters (use `openssl rand -hex 64`).
- [ ] `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD` are strong, unique passwords.
- [ ] `CORS_ORIGIN` lists the real public frontend origin (e.g. `https://app.example.com`).
- [ ] Domain DNS is configured and pointing to your reverse proxy.
- [ ] TLS certificate is provisioned (Let's Encrypt / Cloudflare / etc.).

### Database

- [ ] MySQL 8 instance is provisioned (managed service recommended: AWS RDS, DigitalOcean, GCP Cloud SQL).
- [ ] `DATABASE_URL` constructed with the production credentials.
- [ ] Database backups are enabled and tested.
- [ ] Run the initial migration:

```bash
DATABASE_URL="mysql://user:pass@host:3306/db" \
  npx prisma migrate deploy
```

- [ ] Seed the database (only on a fresh install):

```bash
DATABASE_URL="..." npx tsx prisma/seed.ts
```

> ⚠️ **Note:** the seed script wipes existing data. Run it only on first install or in dev.

- [ ] Create a real production admin via the API (NOT by re-running the seed):

```bash
curl -X POST https://api.example.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Prod Admin","email":"admin@example.com","password":"StrongPass1"}'
# Then update the role to ADMIN directly in the DB:
mysql> UPDATE users SET role='ADMIN' WHERE email='admin@example.com';
```

### Deploy the Stack

#### Option A — docker-compose on a single VPS

```bash
# 1. Copy .env.example to .env and fill in values
cp .env.example .env
$EDITOR .env

# 2. Pull and start
docker compose pull   # if using GHCR images
docker compose up -d --build

# 3. Tail logs
docker compose logs -f --tail=100

# 4. Verify health
curl https://api.example.com/api/health
```

#### Option B — split services (managed Kubernetes / ECS)

- Push images from CI to your registry (`ghcr.io`, `docker.io`, ECR, GCR, ACR).
- Run a managed MySQL service.
- Deploy backend with at least 2 replicas behind a load balancer.
- Deploy frontend as a static site on CDN (CloudFront, Cloudflare, Netlify, Vercel).

### Post-deployment

- [ ] Visit `https://app.example.com/` — login page loads.
- [ ] Visit `https://api.example.com/api/health` — returns 200.
- [ ] Visit `https://api.example.com/api/docs` — Swagger UI loads.
- [ ] Log in with `admin@example.com` / your password.
- [ ] Create a project, a task, assign a user.
- [ ] Check that the notification bell shows the assignment.
- [ ] Open the Kanban board, drag a task across columns.
- [ ] Add a comment, confirm it appears.
- [ ] Visit `/admin` as admin — stats load.

### Ongoing

- [ ] Backups: nightly `mysqldump` to off-site storage.
- [ ] Logs: ship to your aggregator (Loki, Datadog, ELK).
- [ ] Monitoring: scrape `/api/health`, alert on 5xx rate.
- [ ] Dependency updates: enable Dependabot / Renovate.
- [ ] Rotate `JWT_SECRET` and `MYSQL_PASSWORD` every 90 days.

## Rollback

If a deploy breaks:

```bash
# Roll back to a known-good image tag
docker compose down
docker compose up -d --force-recreate backend tms-backend:previous-sha
```

For database:

```bash
# Restore from backup (assumes a recent dump is in /backups/)
docker compose exec -T mysql \
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" task_management < /backups/2026-09-27.sql
```

## Release Tags

- `v1.0.0` — MVP (Auth + Users + Projects + Tasks + Dashboard)
- `v1.1.0` — Collaboration (Kanban, Comments, Notifications, Admin)
- `v1.2.0` — Quality & Security (testing, sanitization, helmet, rate limits)
- `v2.0.0` — Production (Docker, CI/CD, Swagger, deployment)
