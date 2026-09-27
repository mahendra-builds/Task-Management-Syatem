import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';

const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/projects', projectRoutes);
apiRoutes.use('/tasks', taskRoutes);

// Phase 6+ feature routes get mounted here:
// apiRoutes.use('/comments', commentRoutes);
// apiRoutes.use('/notifications', notificationRoutes);
// apiRoutes.use('/admin', adminRoutes);

export default apiRoutes;
