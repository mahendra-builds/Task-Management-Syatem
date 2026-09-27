import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addMemberSchema,
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  removeMemberParamsSchema,
  updateProjectSchema,
} from '../validators/project.validators';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: List projects visible to the current user
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [PLANNING, ACTIVE, COMPLETED, ARCHIVED] } }
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *     responses:
 *       200: { description: OK }
 */
router.get('/', validate(listProjectsQuerySchema, 'query'), projectController.list);

/**
 * @openapi
 * /api/projects:
 *   post:
 *     summary: Create a project (current user becomes owner)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/', validate(createProjectSchema), projectController.create);

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by id
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', validate(projectIdParamSchema, 'params'), projectController.getOne);

/**
 * @openapi
 * /api/projects/{id}:
 *   patch:
 *     summary: Update project (owner or project manager)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Not allowed }
 */
router.patch(
  '/:id',
  validate(projectIdParamSchema, 'params'),
  validate(updateProjectSchema),
  projectController.update,
);

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project (owner only)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Not the owner }
 */
router.delete('/:id', validate(projectIdParamSchema, 'params'), projectController.delete);

/**
 * @openapi
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add a member to the project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       201: { description: Created }
 *       409: { description: Already a member }
 */
router.post(
  '/:id/members',
  validate(addMemberSchema),
  validate(projectIdParamSchema, 'params'),
  projectController.addMember,
);

/**
 * @openapi
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: OK }
 */
router.delete(
  '/:id/members/:userId',
  validate(removeMemberParamsSchema, 'params'),
  projectController.removeMember,
);

export default router;
