import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);

// Phase 3+ feature routes get mounted here:
// apiRoutes.use('/users', userRoutes);
// apiRoutes.use('/projects', projectRoutes);
// apiRoutes.use('/tasks', taskRoutes);
// apiRoutes.use('/comments', commentRoutes);
// apiRoutes.use('/notifications', notificationRoutes);
// apiRoutes.use('/admin', adminRoutes);

export default apiRoutes;
