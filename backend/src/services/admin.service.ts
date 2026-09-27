import { prisma } from '../config/prisma';

export const adminService = {
  async stats() {
    const [users, activeUsers, projects, tasks, openTasks, completedTasks, comments, notifications] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.project.count(),
        prisma.task.count(),
        prisma.task.count({
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        }),
        prisma.task.count({ where: { status: 'COMPLETED' } }),
        prisma.comment.count(),
        prisma.notification.count(),
      ]);

    const [projectsByStatus, tasksByStatus, tasksByPriority, usersByRole] = await Promise.all([
      prisma.project.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.task.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.task.groupBy({ by: ['priority'], _count: { _all: true } }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    ]);

    return {
      totals: { users, activeUsers, projects, tasks, openTasks, completedTasks, comments, notifications },
      breakdown: {
        projectsByStatus: projectsByStatus.reduce(
          (acc, r) => ({ ...acc, [r.status]: r._count._all }),
          {} as Record<string, number>,
        ),
        tasksByStatus: tasksByStatus.reduce(
          (acc, r) => ({ ...acc, [r.status]: r._count._all }),
          {} as Record<string, number>,
        ),
        tasksByPriority: tasksByPriority.reduce(
          (acc, r) => ({ ...acc, [r.priority]: r._count._all }),
          {} as Record<string, number>,
        ),
        usersByRole: usersByRole.reduce(
          (acc, r) => ({ ...acc, [r.role]: r._count._all }),
          {} as Record<string, number>,
        ),
      },
    };
  },

  async listAllProjects(params: { page?: number; pageSize?: number; status?: string; q?: string }) {
    const { page = 1, pageSize = 20, status, q } = params;
    const where = {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  async listAllTasks(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    q?: string;
  }) {
    const { page = 1, pageSize = 20, status, priority, q } = params;
    const where = {
      ...(status ? { status: status as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },
};
