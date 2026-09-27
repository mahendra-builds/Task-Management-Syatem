import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createCommentSchema,
  updateCommentSchema,
} from '../validators/comment.validators';

const router = Router();

/**
 * @openapi
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: List comments for a task
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: taskId, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: No access }
 */
router.get('/tasks/:taskId/comments', authenticate, commentController.list);

/**
 * @openapi
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: taskId, required: true, schema: { type: string } }]
 *     responses:
 *       201: { description: Created }
 */
router.post(
  '/tasks/:taskId/comments',
  authenticate,
  validate(createCommentSchema),
  commentController.create,
);

/**
 * @openapi
 * /api/tasks/{taskId}/comments/{commentId}:
 *   patch:
 *     summary: Edit your own comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: taskId, required: true, schema: { type: string } }
 *       - { in: path, name: commentId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Not the author }
 */
router.patch(
  '/tasks/:taskId/comments/:commentId',
  authenticate,
  validate(updateCommentSchema),
  commentController.update,
);

/**
 * @openapi
 * /api/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (author or admin)
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: taskId, required: true, schema: { type: string } }
 *       - { in: path, name: commentId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 */
router.delete(
  '/tasks/:taskId/comments/:commentId',
  authenticate,
  commentController.delete,
);

/**
 * @openapi
 * /api/tasks/{taskId}/activity:
 *   get:
 *     summary: Activity log for a task
 *     tags: [Activity]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: taskId, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/tasks/:taskId/activity', authenticate, commentController.listTaskActivity);

/**
 * @openapi
 * /api/projects/{projectId}/activity:
 *   get:
 *     summary: Activity log for a project
 *     tags: [Activity]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: projectId, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/projects/:projectId/activity', authenticate, commentController.listProjectActivity);

export default router;
