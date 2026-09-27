# Task Management System

A full-stack task management application built as a real-world reference project.

## Status

✅ **v2.0.0** — Production-ready. All 18 phases of the development plan are complete.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Router
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Database:** MySQL 8
- **Auth:** JWT (HS256) + bcrypt
- **Tests:** Jest + Supertest + Vitest + React Testing Library
- **API Docs:** Swagger / OpenAPI 3.0 (served at `/api/docs`)
- **CI/CD:** GitHub Actions (lint → test → build → docker → publish)
- **Deployment:** Docker + docker-compose

## Quick Start

### Option A — Local (Node + MySQL)

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Update DATABASE_URL in backend/.env

npm run prisma:migrate
npm run prisma:seed

npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

Default seeded user: `admin@example.com / Admin@123`

### Option B — docker-compose (everything in containers)

```bash
cp .env.example .env
$EDITOR .env                      # set MYSQL passwords, JWT_SECRET, CORS_ORIGIN
docker compose up -d --build
docker compose exec backend npx tsx prisma/seed.ts
```

- Frontend: http://localhost:8080
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

## NPM Scripts

| Command                        | Description                              |
|--------------------------------|------------------------------------------|
| `npm run dev`                  | Start backend + frontend concurrently    |
| `npm run build`                | Build both workspaces                    |
| `npm run lint`                 | Lint both workspaces                     |
| `npm run test`                 | Run all tests                            |
| `npm run prisma:migrate`       | Apply Prisma migrations                  |
| `npm run prisma:seed`          | Seed database                            |

## Repository Layout

```
/
├── frontend/                React + Vite + TypeScript client
├── backend/                 Node + Express + Prisma API
├── docs/                    Architecture, deployment, security, DB
│   ├── database.md
│   ├── deployment.md
│   ├── deployment-runbook.md
│   ├── ci-cd.md
│   └── security.md
├── .github/workflows/       GitHub Actions CI/CD
├── docker-compose.yml       Full stack in containers
├── PROJECT_PLAN.md          18-phase development plan
└── README.md
```

## Development Workflow

- `main` is production-only.
- `develop` is the integration branch.
- All work happens on `feature/*` branches off `develop`.
- Conventional Commits enforced.
- PRs merge into `develop`; releases tag from `main`.

## Documentation

- [`docs/database.md`](./docs/database.md) — ER diagram, table reference, migrations
- [`docs/security.md`](./docs/security.md) — Security review
- [`docs/deployment.md`](./docs/deployment.md) — Docker & deployment guide
- [`docs/deployment-runbook.md`](./docs/deployment-runbook.md) — Production runbook
- [`docs/ci-cd.md`](./docs/ci-cd.md) — CI/CD pipeline
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — Full 18-phase plan

## Releases

| Tag     | Milestone                                         |
|---------|---------------------------------------------------|
| v1.0.0  | MVP — Auth, Users, Projects, Tasks, Dashboard     |
| v1.1.0  | Collaboration — Kanban, Comments, Notifications, Admin |
| v1.2.0  | Quality & Security — testing, sanitization, hardening |
| v2.0.0  | Production — Docker, CI/CD, Swagger, deployment    |

## License

MIT
