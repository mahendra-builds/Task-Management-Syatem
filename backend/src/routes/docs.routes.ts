import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

const router = Router();

router.get('/json', (_req, res) => {
  res.json(swaggerSpec);
});

router.get('/json/', (_req, res) => {
  res.json(swaggerSpec);
});

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Task Management API',
  swaggerOptions: { persistAuthorization: true },
}));

export default router;
