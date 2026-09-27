import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List current user's notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: unread, schema: { type: boolean } }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', notificationController.list);

/**
 * @openapi
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/unread-count', notificationController.unreadCount);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.patch('/:id/read', notificationController.markRead);

/**
 * @openapi
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.patch('/read-all', notificationController.markAllRead);

export default router;
