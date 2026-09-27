import { TaskStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  myTasks: Awaited<ReturnType<typeof getMyTasks>>;
  recent: Awaited<ReturnType<typeof getRecent>>;
  upcoming: Awaited<ReturnType<typeof getUpcoming>>;
  overdue: Awaited<ReturnType<typeof getOverdue>>;
  projectSummary: Awaited<ReturnType<typeof getProjectSummary>>;
}

async function getMyTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    take: 10,
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

async function getRecent(userId: string) {
  return prisma.task.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

async function getUpcoming(userId: string) {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
      dueDate: { gte: now, lte: next7Days },
      status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: { project: { select: { id: true, name: true } } },
  });
}

async function getOverdue(userId: string) {
  const now = new Date();
  return prisma.task.findMany({
    where: {
      OR: [
        { assignedToId: userId },
        { createdById: userId },
      ],
      dueDate: { lt: now },
      status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });
}

async function getProjectSummary(userId: string) {
  const visibility: Prisma.ProjectWhereInput = {
    OR: [{ ownerId: userId }, { members: { some: { userId } } }],
  };

  const [active, planning, completed, archived] = await Promise.all([
    prisma.project.count({ where: { AND: [visibility, { status: 'ACTIVE' }] } }),
    prisma.project.count({ where: { AND: [visibility, { status: 'PLANNING' }] } }),
    prisma.project.count({ where: { AND: [visibility, { status: 'COMPLETED' }] } }),
    prisma.project.count({ where: { AND: [visibility, { status: 'ARCHIVED' }] } }),
  ]);

  return { active, planning, completed, archived };
}

export const dashboardService = {
  async getDashboard(userId: string): Promise<DashboardData> {
    const visibility: Prisma.TaskWhereInput = {
      OR: [
        { assignedToId: userId },
        { createdById: userId },
        {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
      ],
    };

    const now = new Date();

    const [total, pending, inProgress, completed, overdue, myTasks, recent, upcoming, overdueTasks, projectSummary] =
      await Promise.all([
        prisma.task.count({ where: visibility }),
        prisma.task.count({
          where: { AND: [visibility, { status: { in: [TaskStatus.TODO, TaskStatus.BLOCKED] } }] },
        }),
        prisma.task.count({
          where: { AND: [visibility, { status: TaskStatus.IN_PROGRESS }] },
        }),
        prisma.task.count({
          where: { AND: [visibility, { status: TaskStatus.COMPLETED }] },
        }),
        prisma.task.count({
          where: {
            AND: [
              visibility,
              { dueDate: { lt: now }, status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] } },
            ],
          },
        }),
        getMyTasks(userId),
        getRecent(userId),
        getUpcoming(userId),
        getOverdue(userId),
        getProjectSummary(userId),
      ]);

    return {
      stats: { total, pending, inProgress, completed, overdue },
      myTasks,
      recent,
      upcoming,
      overdue: overdueTasks,
      projectSummary,
    };
  },
};
