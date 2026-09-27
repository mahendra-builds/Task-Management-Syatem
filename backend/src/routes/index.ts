import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);

// Phase 4+ feature routes get mounted here:
// apiRoutes.use('/projects', projectRoutes);
// apiRoutes.use('/tasks', taskRoutes);
// apiRoutes.use('/comments', commentRoutes);
// apiRoutes.use('/notifications', notificationRoutes);
// apiRoutes.use('/admin', adminRoutes);

export default apiRoutes;
