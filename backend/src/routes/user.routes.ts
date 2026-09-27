import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  adminUpdateUserSchema,
  changePasswordSchema,
  idParamSchema,
  updateProfileSchema,
} from '../validators/user.validators';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', requireRole(Role.ADMIN), userController.list);

/**
 * @openapi
 * /api/users/me/profile:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.patch('/me/profile', validate(updateProfileSchema), userController.updateProfile);

/**
 * @openapi
 * /api/users/me/password:
 *   post:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Current password is incorrect }
 */
router.post('/me/password', validate(changePasswordSchema), userController.changePassword);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', validate(idParamSchema, 'params'), userController.getOne);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     summary: Admin update a user (role, active state, name, avatar)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Not admin }
 */
router.patch(
  '/:id',
  requireRole(Role.ADMIN),
  validate(idParamSchema, 'params'),
  validate(adminUpdateUserSchema),
  userController.adminUpdate,
);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Admin delete a user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Not admin }
 */
router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  validate(idParamSchema, 'params'),
  userController.adminDelete,
);

export default router;
