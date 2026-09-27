import { prisma } from '../config/prisma';

export const notificationService = {
  async listForUser(userId: string, onlyUnread = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async unreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  async markRead(userId: string, id: string) {
    const n = await prisma.notification.findUnique({ where: { id } });
    if (!n || n.userId !== userId) {
      return null;
    }
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: 'All notifications marked as read' };
  },
};
