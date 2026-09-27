# Multi-stage Dockerfile for the backend

# ─── Builder ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm install --no-audit --no-fund --workspaces=false
WORKDIR /app/backend
RUN npm install --no-audit --no-fund --include=dev

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# ─── Production ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/package-lock.json ./backend/package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

WORKDIR /app/backend
EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
