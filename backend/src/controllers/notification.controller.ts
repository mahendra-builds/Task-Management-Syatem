import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { ok } from '../utils/response';
import { unauthorized } from '../middleware/errorHandler';

export const notificationController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const onlyUnread = req.query.unread === 'true';
    const items = await notificationService.listForUser(req.user.id, onlyUnread);
    res.json(ok(items));
  },

  async unreadCount(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const count = await notificationService.unreadCount(req.user.id);
    res.json(ok({ count }));
  },

  async markRead(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const n = await notificationService.markRead(req.user.id, req.params.id);
    if (!n) {
      res.status(404).json({ success: false, message: 'Notification not found', code: 'NOT_FOUND' });
      return;
    }
    res.json(ok(n));
  },

  async markAllRead(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await notificationService.markAllRead(req.user.id);
    res.json(ok(result));
  },
};
