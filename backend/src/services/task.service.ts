import { PrismaClient, TaskStatus, Prisma, NotificationType, ActivityAction } from '@prisma/client';
import { badRequest, forbidden, notFound } from '../middleware/errorHandler';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ListTasksQuery,
} from '../validators/task.validators';

const prisma = new PrismaClient();

const TASK_INCLUDE = {
  project: {
    select: { id: true, name: true, status: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  assignedTo: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskInclude;

export const taskService = {
  async list(userId: string, query: ListTasksQuery) {
    const { projectId, status, priority, assignedToMe, q, page, pageSize } = query;

    const visibilityFilter: Prisma.TaskWhereInput = {
      OR: [
        { createdById: userId },
        { assignedToId: userId },
        {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
      ],
    };

    const where: Prisma.TaskWhereInput = {
      AND: [
        visibilityFilter,
        ...(projectId ? [{ projectId }] : []),
        ...(status ? [{ status }] : []),
        ...(priority ? [{ priority }] : []),
        ...(assignedToMe ? [{ assignedToId: userId }] : []),
        ...(q
          ? [
              {
                OR: [
                  { title: { contains: q } },
                  { description: { contains: q } },
                ],
              },
            ]
          : []),
      ],
    };

    const [items, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  async getById(userId: string, id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { ...TASK_INCLUDE, project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');
    await this._assertCanRead(userId, task.project);
    return task;
  },

  async create(userId: string, input: CreateTaskInput) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      include: { members: true },
    });
    if (!project) throw notFound('Project not found');
    await this._assertCanEdit(userId, project);

    if (input.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
      if (!assignee) throw badRequest('Assignee not found');
      if (!assignee.isActive) throw badRequest('Cannot assign to inactive user');
    }

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        projectId: input.projectId,
        createdById: userId,
        assignedToId: input.assignedToId ?? null,
        status: input.status ?? TaskStatus.TODO,
        priority: input.priority ?? 'MEDIUM',
        dueDate: input.dueDate ?? null,
      },
      include: TASK_INCLUDE,
    });

    await prisma.activityLog.create({
      data: {
        action: ActivityAction.TASK_CREATED,
        actorId: userId,
        projectId: input.projectId,
        taskId: task.id,
        metadata: { title: task.title },
      },
    });

    if (input.assignedToId && input.assignedToId !== userId) {
      await this._createNotification(input.assignedToId, {
        type: NotificationType.TASK_ASSIGNED,
        message: `You were assigned to "${task.title}"`,
        link: `/tasks/${task.id}`,
        userId: input.assignedToId,
      });
      await prisma.activityLog.create({
        data: {
          action: ActivityAction.TASK_ASSIGNED,
          actorId: userId,
          taskId: task.id,
          metadata: { assigneeId: input.assignedToId },
        },
      });
    }

    return task;
  },

  async update(userId: string, id: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');
    await this._assertCanEdit(userId, task.project);

    if (input.assignedToId !== undefined && input.assignedToId !== null) {
      const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
      if (!assignee) throw badRequest('Assignee not found');
    }

    const previousAssignee = task.assignedToId;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      },
      include: TASK_INCLUDE,
    });

    if (input.priority !== undefined && input.priority !== task.priority) {
      await prisma.activityLog.create({
        data: {
          action: ActivityAction.TASK_PRIORITY_CHANGED,
          actorId: userId,
          taskId: id,
          metadata: { from: task.priority, to: input.priority },
        },
      });
    }

    if (
      input.assignedToId !== undefined &&
      input.assignedToId !== previousAssignee &&
      input.assignedToId !== null
    ) {
      await this._createNotification(input.assignedToId, {
        type: NotificationType.TASK_ASSIGNED,
        message: `You were assigned to "${updated.title}"`,
        link: `/tasks/${updated.id}`,
        userId: input.assignedToId,
      });
      await prisma.activityLog.create({
        data: {
          action: ActivityAction.TASK_ASSIGNED,
          actorId: userId,
          taskId: id,
          metadata: { assigneeId: input.assignedToId },
        },
      });
    }

    return updated;
  },

  async updateStatus(userId: string, id: string, status: TaskStatus) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');
    await this._assertCanRead(userId, task.project);

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
      },
      include: TASK_INCLUDE,
    });

    await prisma.activityLog.create({
      data: {
        action: ActivityAction.TASK_STATUS_CHANGED,
        actorId: userId,
        taskId: id,
        metadata: { from: task.status, to: status },
      },
    });

    if (status === TaskStatus.COMPLETED && task.assignedToId && task.assignedToId !== userId) {
      await this._createNotification(task.assignedToId, {
        type: NotificationType.TASK_COMPLETED,
        message: `Task "${updated.title}" was marked completed`,
        link: `/tasks/${updated.id}`,
        userId: task.assignedToId,
      });
    }

    return updated;
  },

  async assign(userId: string, id: string, assigneeId: string | null) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');
    await this._assertCanEdit(userId, task.project);

    if (assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (!assignee) throw badRequest('Assignee not found');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { assignedToId: assigneeId },
      include: TASK_INCLUDE,
    });

    if (assigneeId && assigneeId !== userId) {
      await this._createNotification(assigneeId, {
        type: NotificationType.TASK_ASSIGNED,
        message: `You were assigned to "${updated.title}"`,
        link: `/tasks/${updated.id}`,
        userId: assigneeId,
      });
    }

    return updated;
  },

  async delete(userId: string, id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');

    const isCreator = task.createdById === userId;
    const isOwner = task.project.ownerId === userId;
    const isManager = task.project.members.some(
      (m) => m.userId === userId && (m.role === 'MANAGER' || m.role === 'OWNER'),
    );
    if (!isCreator && !isOwner && !isManager) {
      throw forbidden('You cannot delete this task');
    }

    await prisma.task.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: ActivityAction.TASK_DELETED,
        actorId: userId,
        projectId: task.projectId,
        metadata: { title: task.title },
      },
    });

    return { message: 'Task deleted' };
  },

  async _createNotification(
    userId: string,
    data: { type: NotificationType; message: string; link?: string; userId: string },
  ) {
    await prisma.notification.create({ data });
  },

  async _assertCanRead(
    userId: string,
    project: { id: string; ownerId: string; members: Array<{ userId: string }> },
  ) {
    if (project.ownerId === userId) return;
    if (project.members.some((m) => m.userId === userId)) return;
    throw forbidden('You do not have access to this task');
  },

  async _assertCanEdit(
    userId: string,
    project: { id: string; ownerId: string; members: Array<{ userId: string; role: string }> },
  ) {
    if (project.ownerId === userId) return;
    const m = project.members.find((mm) => mm.userId === userId);
    if (m && (m.role === 'MANAGER' || m.role === 'OWNER')) return;
    throw forbidden('You do not have permission to modify this project');
  },
};
