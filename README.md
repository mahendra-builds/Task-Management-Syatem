# Task Management System

A full-stack task management application built as a real-world reference project.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** MySQL + Prisma ORM
- **Auth:** JWT + bcrypt
- **Tests:** Jest + Supertest + React Testing Library
- **Docs:** Swagger / OpenAPI
- **CI/CD:** GitHub Actions
- **Deployment:** Docker

## Repository Layout

```
/
├── frontend/         React + Vite + TypeScript client
├── backend/          Node + Express + Prisma API
├── docs/             ER diagrams, API docs, architecture notes
├── .github/workflows/  CI/CD pipelines
├── docker-compose.yml  Local dev stack (added in Phase 16)
├── PROJECT_PLAN.md   Full development plan
└── README.md         (this file)
```

## Quick Start (Local Dev)

```bash
# 1. Install dependencies (uses npm workspaces)
npm install

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Run database (Phase 16 introduces docker-compose; before that use a local MySQL)
# Update DATABASE_URL in backend/.env

# 4. Run Prisma migrations + seed
npm run prisma:migrate
npm run prisma:seed

# 5. Start both servers (concurrently)
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:4000
- API docs (Phase 15+): http://localhost:4000/api/docs

## Default Seeded User

| Role   | Email             | Password    |
|--------|-------------------|-------------|
| ADMIN  | admin@example.com | Admin@123   |

## NPM Scripts

| Command            | Description                                |
|--------------------|--------------------------------------------|
| `npm run dev`      | Start backend + frontend concurrently      |
| `npm run build`    | Build both workspaces                      |
| `npm run lint`     | Lint both workspaces                       |
| `npm run format`   | Prettier write                             |
| `npm run test`     | Run all tests                              |
| `npm run prisma:migrate` | Apply Prisma migrations             |
| `npm run prisma:seed`    | Seed database                        |

## Development Workflow

- `main` is production-only.
- `develop` is the integration branch.
- All work happens on `feature/*` branches off `develop`.
- Conventional Commits enforced.
- PRs merge into `develop`; releases tag from `main`.

See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the full 18-phase plan.

## License

MIT
