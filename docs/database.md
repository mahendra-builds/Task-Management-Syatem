# Database Design

## Stack

- **DBMS:** MySQL 8.x
- **ORM:** Prisma 5.x
- **Schema source:** `backend/prisma/schema.prisma`

## Tables (7)

| Table | Purpose |
|---|---|
| `users` | Application users with role-based access |
| `projects` | Top-level project containers |
| `project_members` | Many-to-many users ↔ projects (with per-project role) |
| `tasks` | Units of work belonging to a project |
| `comments` | Threaded comments on tasks |
| `notifications` | Per-user notifications |
| `activity_logs` | Audit trail of important events |

Auxiliary: `refresh_tokens` for JWT refresh flow.

## ER Diagram

```
┌──────────┐       ┌──────────┐
│   User   │──┐    │ Project  │
│ (users)  │  │    │(projects)│
└──────────┘  │    └──────────┘
     │   │    │         │
     │   │    └────┐    │
     │   │         ▼    ▼
     │   │   ┌────────────────┐
     │   └──>│ ProjectMember  │
     │       │(project_members)│
     │       └────────────────┘
     │
     │       ┌──────────┐
     ├──────>│   Task   │
     │       │ (tasks)  │<──┐
     │       └──────────┘   │
     │            │         │
     │            ▼         │
     │       ┌──────────┐   │
     ├──────>│ Comment  │   │
     │       │(comments)│   │
     │       └──────────┘   │
     │                      │
     │       ┌──────────┐   │
     ├──────>│Notifica- │   │
     │       │  tion    │   │
     │       │(notifica-│   │
     │       │  tions)  │   │
     │       └──────────┘   │
     │                      │
     │       ┌──────────┐   │
     └──────>│ Activity │<──┘
             │   Log    │
             │(activity │
             │  _logs)  │
             └──────────┘
```

## Relationships

| From | Relation | To | Notes |
|---|---|---|---|
| `User` 1 → N | owner | `Project` | `ownerId` FK |
| `User` N ↔ N | membership | `Project` | via `ProjectMember` |
| `Project` 1 → N | contains | `Task` | `projectId` FK |
| `User` 1 → N | created | `Task` | `createdById` FK |
| `User` 1 → N | assigned | `Task` | `assignedToId` FK (nullable) |
| `Task` 1 → N | has | `Comment` | `taskId` FK |
| `User` 1 → N | authored | `Comment` | `authorId` FK |
| `User` 1 → N | receives | `Notification` | `userId` FK |
| `User` 1 → N | performed | `ActivityLog` | `actorId` FK |
| `Project` 1 → N | log target | `ActivityLog` | optional |
| `Task` 1 → N | log target | `ActivityLog` | optional |

## Enums

- `Role`: `ADMIN` | `MANAGER` | `MEMBER`
- `ProjectStatus`: `PLANNING` | `ACTIVE` | `COMPLETED` | `ARCHIVED`
- `ProjectMemberRole`: `OWNER` | `MANAGER` | `MEMBER` | `VIEWER`
- `TaskStatus`: `TODO` | `IN_PROGRESS` | `IN_REVIEW` | `COMPLETED` | `BLOCKED` | `CANCELLED`
- `TaskPriority`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
- `NotificationType`: `TASK_ASSIGNED` | `TASK_UPDATED` | `TASK_COMMENTED` | `TASK_DUE_SOON` | `TASK_COMPLETED`
- `ActivityAction`: 12 actions (see schema)

## Seed Data

`npm run prisma:seed` populates:

- 1 admin (`admin@example.com / Admin@123`)
- 1 manager (`alice@example.com / Admin@123`)
- 2 members (`bob@example.com / Member@123`, `carol@example.com / Member@123`)
- 2 projects ("Website Redesign", "Mobile App")
- 4 tasks across the two projects

## Migrations

```bash
# Create a new migration
npm run prisma:migrate -- --name <name>

# Apply pending migrations (production / CI)
npm run prisma:migrate:deploy

# Regenerate client after schema changes
npm run prisma:generate
```
