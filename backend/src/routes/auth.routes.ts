import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth.validators';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email already in use }
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Bad credentials }
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out (stateless, client discards token)
 *     tags: [Auth]
 *     responses:
 *       200: { description: OK }
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticate, authController.me);

export default router;
