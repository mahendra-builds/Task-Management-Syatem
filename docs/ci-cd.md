# CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`.

## Jobs

### 1. `backend-lint-test`

- Runs on every push & PR.
- Installs backend dependencies.
- Generates the Prisma client.
- Lints (`npm run lint`).
- Runs tests with `npm test`.
- Builds TypeScript (`npm run build`).

### 2. `frontend-lint-test-build`

- Same shape as backend, working in the `frontend/` directory.
- Uses `NODE_OPTIONS=--max-old-space-size=8192` to avoid the Vite build OOM.
- Builds with `VITE_API_BASE_URL=/api` for production-like output.

### 3. `docker-build`

- Depends on both lint-test jobs passing.
- Uses QEMU + Buildx to build multi-arch images.
- Builds `backend/Dockerfile` and `frontend/Dockerfile`.
- Uses GitHub Actions cache (`type=gha`) for faster rebuilds.

### 4. `publish-images`

- Only on `push` to `main`.
- Logs in to GitHub Container Registry.
- Pushes `backend` and `frontend` images tagged with the commit SHA.

## Local parity

```bash
npm ci
npm run lint
npm test
npm run build
```

## Required secrets (for publishing)

- `GITHUB_TOKEN` — automatically provided by GitHub Actions.
