# Multi-stage Dockerfile for the frontend

# ─── Builder ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
RUN npm install --no-audit --no-fund --workspaces=false
WORKDIR /app/frontend
RUN npm install --no-audit --no-fund

COPY frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ─── Production (nginx) ─────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost/ || exit 1
