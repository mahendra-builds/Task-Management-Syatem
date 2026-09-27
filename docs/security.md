# Security Review

A consolidated view of the security measures applied across the Task Management System.

## 1. Password Hashing

- Algorithm: **bcrypt** with cost factor 12.
- All passwords stored as hashes; never returned to the client.
- Validation rules: min 8 chars, must include uppercase, lowercase, and digit.
- Hashing lives in `backend/src/utils/password.ts`.

## 2. JWT Tokens

- HS256 signing via `jsonwebtoken`.
- Default expiry: **7 days** (configurable via `JWT_EXPIRES_IN`).
- Secret: at least 32 random chars in production (`JWT_SECRET`).
- Token payload: `{ sub, email, role }`.
- Verified by `authenticate` middleware on every protected route.
- Authorization header must be `Bearer <token>`.

## 3. Input Validation

- **Zod** schemas for every request body, query, and param across all routes.
- Validation failures return `400` with structured `errors` field listing field-level issues.
- No string concatenation in DB queries — **Prisma** uses parameterized queries throughout, eliminating SQL injection.

## 4. HTTP Headers

- **Helmet** adds secure defaults (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.).
- CORS restricted to the configured `CORS_ORIGIN` env (comma-separated list).
- `trust proxy` set for accurate client IPs behind a reverse proxy.

## 5. Rate Limiting

- `express-rate-limit` defaults to 200 requests / 15 minutes / IP for `/api/*`.
- 429 response with a friendly message when exceeded.

## 6. Role-Based Access Control (RBAC)

- Three roles: `ADMIN`, `MANAGER`, `MEMBER`.
- `requireRole(...)` middleware factory checks the authenticated user's role.
- Resource-level checks in services:
  - Projects: owner or `MANAGER` member can edit; only owner can delete.
  - Tasks: project owner or `MANAGER` member can edit; creator/owner/manager can delete.
  - Users: only admins can list/edit/delete other users.
  - Comments: only the author can edit; author or admin can delete.
- **Last admin protection**: the last active admin cannot be demoted or deleted.

## 7. Password Change

- Requires current password verification before update.
- New password re-validated against complexity rules.

## 8. Account Lifecycle

- `isActive` flag on every user.
- Inactive users cannot log in (returns 401).
- Inactive users cannot be added to projects.

## 9. Activity Logging

- All write operations on projects, tasks, and members write to the `activity_logs` table.
- Notification creation is auditable via the `notifications` table.

## 10. Frontend Hardening

- All API calls go through a single Axios instance with `withCredentials` and `Authorization` header.
- 401 from API clears token and redirects to `/login`.
- Token stored only in `localStorage` (with XSS surface — see "Future Work").
- React Router protects routes via `ProtectedRoute` and `RoleGuard`.

## 11. CORS

- Allowed origins come from `CORS_ORIGIN` env (comma-separated).
- Credentials enabled for cookie-based auth if added later.

## 12. Body Size Limits

- JSON and URL-encoded bodies capped at `1mb`.

## 13. Trust Proxy

- `app.set('trust proxy', 1)` so rate limiting and request IPs work correctly behind one proxy.

## Future Work

- Move JWT to **httpOnly** cookie to mitigate XSS-based token theft.
- Add **CSRF** protection when moving to cookie auth.
- Add **2FA** (TOTP) for admins.
- Centralized audit log API for compliance.
- Automated dependency scanning via Dependabot/Renovate.
- Penetration testing before public launch.
