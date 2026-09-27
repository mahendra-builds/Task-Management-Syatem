import { Router } from 'express';
import healthRoutes from './health.routes';

const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);

// Phase 2+ feature routes get mounted here:
// apiRoutes.use('/auth', authRoutes);
// apiRoutes.use('/users', userRoutes);
// apiRoutes.use('/projects', projectRoutes);
// apiRoutes.use('/tasks', taskRoutes);
// apiRoutes.use('/comments', commentRoutes);
// apiRoutes.use('/notifications', notificationRoutes);
// apiRoutes.use('/admin', adminRoutes);

export default apiRoutes;
