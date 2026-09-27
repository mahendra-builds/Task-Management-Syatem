import { PrismaClient, Prisma, NotificationType, ActivityAction } from '@prisma/client';
import { forbidden, notFound } from '../middleware/errorHandler';
import { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validators';

const prisma = new PrismaClient();

const COMMENT_INCLUDE = {
  author: {
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  },
} satisfies Prisma.CommentInclude;

export const commentService = {
  async listForTask(userId: string, taskId: string) {
    await this._assertCanReadTask(userId, taskId);
    return prisma.comment.findMany({
      where: { taskId },
      include: COMMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  },

  async create(userId: string, taskId: string, input: CreateCommentInput) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');
    await this._assertCanRead(userId, task.project);

    const comment = await prisma.comment.create({
      data: {
        content: input.content,
        taskId,
        authorId: userId,
      },
      include: COMMENT_INCLUDE,
    });

    await prisma.activityLog.create({
      data: {
        action: ActivityAction.TASK_COMMENTED,
        actorId: userId,
        taskId,
        metadata: { commentId: comment.id },
      },
    });

    const targets = new Set<string>();
    if (task.assignedToId && task.assignedToId !== userId) targets.add(task.assignedToId);
    if (task.createdById !== userId) targets.add(task.createdById);

    for (const recipient of targets) {
      await prisma.notification.create({
        data: {
          type: NotificationType.TASK_COMMENTED,
          message: `${comment.author.name} commented on "${task.title}"`,
          userId: recipient,
          link: `/tasks/${task.id}`,
        },
      });
    }

    return comment;
  },

  async update(userId: string, taskId: string, commentId: string, input: UpdateCommentInput) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw notFound('Comment not found');
    if (comment.taskId !== taskId) throw notFound('Comment does not belong to this task');
    if (comment.authorId !== userId) throw forbidden('You can only edit your own comments');

    return prisma.comment.update({
      where: { id: commentId },
      data: { content: input.content },
      include: COMMENT_INCLUDE,
    });
  },

  async delete(userId: string, taskId: string, commentId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw notFound('Comment not found');
    if (comment.taskId !== taskId) throw notFound('Comment does not belong to this task');
    if (comment.authorId !== userId && !isAdmin) {
      throw forbidden('You can only delete your own comments');
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  },

  async listActivityForTask(taskId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      }),
      prisma.activityLog.count({ where: { taskId } }),
    ]);
    return { items, total, page, pageSize };
  },

  async listActivityForProject(projectId: string, page = 1, pageSize = 50) {
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      }),
      prisma.activityLog.count({ where: { projectId } }),
    ]);
    return { items, total, page, pageSize };
  },

  async _assertCanReadTask(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw notFound('Task not found');
    await this._assertCanRead(userId, task.project);
  },

  async _assertCanRead(
    userId: string,
    project: { id: string; ownerId: string; members: Array<{ userId: string }> },
  ) {
    if (project.ownerId === userId) return;
    if (project.members.some((m) => m.userId === userId)) return;
    throw forbidden('You do not have access to this task');
  },
};
