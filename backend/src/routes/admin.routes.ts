import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate, requireRole(Role.ADMIN));

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     summary: System-wide stats (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/stats', adminController.stats);

/**
 * @openapi
 * /api/admin/projects:
 *   get:
 *     summary: List all projects (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/projects', adminController.listAllProjects);

/**
 * @openapi
 * /api/admin/tasks:
 *   get:
 *     summary: List all tasks (admin only)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/tasks', adminController.listAllTasks);

export default router;
