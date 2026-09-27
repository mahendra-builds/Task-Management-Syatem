# Task Management System — Project Plan

## 1. Project Overview

A full-stack task management application where users can log in, create and assign tasks, manage projects, track task status, collaborate through comments, and monitor progress.

### Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MySQL
- ORM: Prisma
- Authentication: JWT + bcrypt
- API: REST
- Version Control: Git + GitHub
- Development: Docker / DDEV-style local containers (optional)
- Testing: Jest + Supertest + React Testing Library
- API Documentation: Swagger / OpenAPI
- CI/CD: GitHub Actions
- Deployment: Frontend + Backend + Managed MySQL

---

# 2. Development Strategy

Use a feature-based development workflow.

### Branches

```text
main
└── develop
    ├── feature/auth
    ├── feature/dashboard
    ├── feature/projects
    ├── feature/tasks
    ├── feature/task-assignment
    ├── feature/kanban
    ├── feature/comments
    ├── feature/notifications
    ├── feature/admin
    └── feature/search-filters
```

### Branch Rules

- `main` = production-ready code
- `develop` = integration branch
- `feature/*` = individual features
- `bugfix/*` = bug fixes
- `hotfix/*` = urgent production fixes
- Never develop directly on `main`
- Open a Pull Request from feature branch → `develop`
- Merge `develop` → `main` for releases

### Commit Convention

Use Conventional Commits:

```text
feat: add user login
feat: add task creation API
fix: resolve task status update issue
refactor: simplify authentication middleware
test: add task controller tests
docs: update API documentation
chore: configure eslint
```

---

# 3. Project Phases

## Phase 0 — Project Setup

### Tasks

- [ ] Create GitHub repository
- [ ] Create `main` and `develop` branches
- [ ] Create React application
- [ ] Create Node.js/Express application
- [ ] Configure MySQL
- [ ] Configure Prisma
- [ ] Configure environment variables
- [ ] Add ESLint + Prettier
- [ ] Create `.gitignore`
- [ ] Create README
- [ ] Create basic folder structure
- [ ] Configure development scripts

### Branch

```text
feature/project-setup
```

### Deliverable

A clean frontend + backend project that can run locally.

---

# 4. Phase 1 — Database Design

## Database Tables

```text
users
projects
project_members
tasks
comments
notifications
activity_logs
```

### Tasks

- [ ] Design database ER diagram
- [ ] Create Prisma schema
- [ ] Create users table
- [ ] Create projects table
- [ ] Create project_members table
- [ ] Create tasks table
- [ ] Create comments table
- [ ] Create notifications table
- [ ] Create activity_logs table
- [ ] Create migrations
- [ ] Create seed data

### Branch

```text
feature/database
```

### Deliverable

Working MySQL database with relationships and seed data.

---

# 5. Phase 2 — Authentication

### Features

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Password hashing
- [ ] JWT authentication
- [ ] Protected API routes
- [ ] Current user API
- [ ] Authentication middleware
- [ ] Role-based access control

### Roles

```text
ADMIN
MANAGER
MEMBER
```

### API

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Branch

```text
feature/auth
```

### Deliverable

Users can securely register, log in, and access protected resources.

---

# 6. Phase 3 — User Management

### Tasks

- [ ] User profile
- [ ] Update profile
- [ ] Change password
- [ ] Profile avatar
- [ ] Admin user list
- [ ] Activate/deactivate users
- [ ] Assign user roles

### Branch

```text
feature/user-management
```

---

# 7. Phase 4 — Project Management

### Features

- [ ] Create project
- [ ] Edit project
- [ ] Delete project
- [ ] View project
- [ ] Add project members
- [ ] Remove project members
- [ ] Project owner
- [ ] Project status

### Project Status

```text
PLANNING
ACTIVE
COMPLETED
ARCHIVED
```

### API

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
```

### Branch

```text
feature/projects
```

---

# 8. Phase 5 — Task Management

This is the core feature.

### Task Fields

```text
title
description
project
created_by
assigned_to
priority
status
due_date
created_at
updated_at
```

### Features

- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] View task
- [ ] Assign task
- [ ] Change priority
- [ ] Change status
- [ ] Set due date
- [ ] Task details page
- [ ] Task ownership/permissions

### Status

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
BLOCKED
CANCELLED
```

### Priority

```text
LOW
MEDIUM
HIGH
URGENT
```

### API

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status
PATCH  /api/tasks/:id/assign
```

### Branch

```text
feature/tasks
```

### Deliverable

Complete task CRUD and workflow management.

---

# 9. Phase 6 — Dashboard

### Dashboard Cards

```text
Total Tasks
Pending Tasks
In Progress
Completed
Overdue
```

### Additional Sections

- [ ] My tasks
- [ ] Recent tasks
- [ ] Upcoming deadlines
- [ ] Overdue tasks
- [ ] Project summary
- [ ] Task statistics

### Branch

```text
feature/dashboard
```

---

# 10. Phase 7 — Kanban Board

### Columns

```text
TODO
IN_PROGRESS
IN_REVIEW
COMPLETED
```

### Tasks

- [ ] Build Kanban UI
- [ ] Drag and drop tasks
- [ ] Update task status after drop
- [ ] Optimistic UI update
- [ ] Handle failed API updates
- [ ] Add filters

### Branch

```text
feature/kanban
```

---

# 11. Phase 8 — Comments & Activity

### Comments

- [ ] Add comment
- [ ] Edit comment
- [ ] Delete comment
- [ ] Display comments

### Activity Log

Track events such as:

```text
Task created
Task assigned
Status changed
Priority changed
Comment added
Task completed
```

### Branch

```text
feature/comments-activity
```

---

# 12. Phase 9 — Notifications

### Notification Types

```text
TASK_ASSIGNED
TASK_UPDATED
TASK_COMMENTED
TASK_DUE_SOON
TASK_COMPLETED
```

### Tasks

- [ ] Notification database
- [ ] Notification API
- [ ] Notification dropdown
- [ ] Mark as read
- [ ] Unread counter

### Branch

```text
feature/notifications
```

---

# 13. Phase 10 — Search & Filters

### Search

Search by:

- Task title
- Description
- Project
- User

### Filters

```text
Status
Priority
Assignee
Project
Due Date
```

### Branch

```text
feature/search-filters
```

---

# 14. Phase 11 — Admin Panel

### Admin Features

- [ ] User management
- [ ] Role management
- [ ] Project management
- [ ] Task overview
- [ ] Activity logs
- [ ] System statistics

### Branch

```text
feature/admin
```

---

# 15. Phase 12 — Frontend UI/UX

### Pages

```text
/login
/register
/dashboard
/projects
/projects/:id
/tasks
/tasks/:id
/kanban
/team
/notifications
/profile
/settings
/admin/users
/admin/projects
/admin/tasks
```

### UI Tasks

- [ ] Responsive layout
- [ ] Sidebar
- [ ] Header
- [ ] Navigation
- [ ] Forms
- [ ] Tables
- [ ] Modals
- [ ] Toast notifications
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Mobile layout

### Branch

```text
feature/ui-ux
```

---

# 16. Phase 13 — Testing

## Backend

- [ ] Authentication tests
- [ ] User tests
- [ ] Project tests
- [ ] Task CRUD tests
- [ ] Permission tests
- [ ] API validation tests

## Frontend

- [ ] Login component tests
- [ ] Dashboard tests
- [ ] Task form tests
- [ ] Kanban tests

## Integration

- [ ] Authentication flow
- [ ] Create project flow
- [ ] Create/assign task flow
- [ ] Complete task flow

### Branch

```text
feature/testing
```

---

# 17. Phase 14 — Security

### Tasks

- [ ] Hash passwords with bcrypt
- [ ] Validate request data
- [ ] Sanitize input
- [ ] JWT security
- [ ] Role-based authorization
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Secure HTTP headers
- [ ] Environment variables
- [ ] SQL injection protection
- [ ] File upload validation
- [ ] Proper error handling

---

# 18. Phase 15 — API Documentation

Document all APIs using Swagger/OpenAPI.

### Documentation

```text
Authentication
Users
Projects
Tasks
Comments
Notifications
Admin
```

### Branch

```text
feature/api-docs
```

---

# 19. Phase 16 — Docker & Production Setup

### Docker Services

```text
frontend
backend
mysql
```

### Tasks

- [ ] Dockerfile frontend
- [ ] Dockerfile backend
- [ ] Docker Compose
- [ ] Production environment variables
- [ ] Database migration strategy
- [ ] Production build

### Branch

```text
feature/docker
```

---

# 20. Phase 17 — CI/CD

Use GitHub Actions.

### Pipeline

```text
Push / Pull Request
        ↓
Install dependencies
        ↓
Lint
        ↓
Run tests
        ↓
Build
        ↓
Deploy
```

### Branch

```text
feature/ci-cd
```

---

# 21. Phase 18 — Deployment

### Production Architecture

```text
                 Internet
                    |
              Frontend App
                    |
                 REST API
                    |
              Node.js Server
                    |
                 Prisma
                    |
                MySQL DB
```

### Deployment Checklist

- [ ] Deploy React frontend
- [ ] Deploy Node.js API
- [ ] Configure production MySQL
- [ ] Configure environment variables
- [ ] Configure CORS
- [ ] Run migrations
- [ ] Create production admin
- [ ] Test production APIs
- [ ] Configure domain
- [ ] Enable HTTPS

---

# 22. Recommended Development Order

Do not build everything at once.

```text
1. Project Setup
       ↓
2. Database
       ↓
3. Authentication
       ↓
4. Users
       ↓
5. Projects
       ↓
6. Tasks
       ↓
7. Dashboard
       ↓
8. Kanban
       ↓
9. Comments & Activity
       ↓
10. Notifications
       ↓
11. Search & Filters
       ↓
12. Admin
       ↓
13. Testing
       ↓
14. Security
       ↓
15. Docker
       ↓
16. CI/CD
       ↓
17. Deployment
```

---

# 23. Definition of Done

A feature is complete only when:

- [ ] Frontend implemented
- [ ] Backend API implemented
- [ ] Database changes completed
- [ ] Validation added
- [ ] Authentication/authorization checked
- [ ] Error handling added
- [ ] Loading/empty states added
- [ ] Tests added
- [ ] Code formatted/linted
- [ ] Documentation updated
- [ ] Pull Request reviewed
- [ ] Merged into `develop`

---

# 24. Git Release Strategy

### Development

```text
feature/* → develop
```

### Release

```text
develop → main
```

### Production Release

Create a version tag:

```text
v1.0.0
v1.1.0
v1.2.0
```

### Version Meaning

```text
MAJOR.MINOR.PATCH

1.0.0 → First stable release
1.1.0 → New feature
1.1.1 → Bug fix
2.0.0 → Major breaking change
```

---

# 25. MVP Scope

The first version should NOT contain everything.

### MVP

```text
Authentication
    +
Users
    +
Projects
    +
Tasks
    +
Task Assignment
    +
Status/Priority
    +
Dashboard
```

After MVP is stable:

```text
Kanban
Comments
Activity Logs
Notifications
Search
Admin Panel
Testing
Docker
CI/CD
Deployment
```

---

# 26. Final Goal

The completed application should demonstrate:

- React development
- REST API development
- Node.js/Express
- MySQL database design
- Authentication
- Authorization
- CRUD operations
- Relational database relationships
- State management
- Responsive UI
- Testing
- Git workflow
- CI/CD
- Docker
- Production deployment

This should be treated as a real-world full-stack application rather than a simple TODO project.
