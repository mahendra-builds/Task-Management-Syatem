import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  assignTaskSchema,
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateStatusSchema,
  updateTaskSchema,
} from '../validators/task.validators';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/tasks:
 *   get:
 *     summary: List tasks visible to the current user
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: projectId, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string, enum: [TODO, IN_PROGRESS, IN_REVIEW, COMPLETED, BLOCKED, CANCELLED] } }
 *       - { in: query, name: priority, schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] } }
 *       - { in: query, name: assignedToMe, schema: { type: boolean } }
 *       - { in: query, name: q, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', validate(listTasksQuerySchema, 'query'), taskController.list);

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/', validate(createTaskSchema), taskController.create);

/**
 * @openapi
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by id
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: No access }
 *       404: { description: Not found }
 */
router.get('/:id', validate(taskIdParamSchema, 'params'), taskController.getOne);

/**
 * @openapi
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update task fields (title, description, priority, dueDate, assignee)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 */
router.patch(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema),
  taskController.update,
);

/**
 * @openapi
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Quick status change
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 */
router.patch(
  '/:id/status',
  validate(taskIdParamSchema, 'params'),
  validate(updateStatusSchema),
  taskController.updateStatus,
);

/**
 * @openapi
 * /api/tasks/{id}/assign:
 *   patch:
 *     summary: Assign / unassign a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 */
router.patch(
  '/:id/assign',
  validate(taskIdParamSchema, 'params'),
  validate(assignTaskSchema),
  taskController.assign,
);

/**
 * @openapi
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 */
router.delete('/:id', validate(taskIdParamSchema, 'params'), taskController.delete);

export default router;
