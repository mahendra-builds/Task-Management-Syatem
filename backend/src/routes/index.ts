import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import dashboardRoutes from './dashboard.routes';
import commentRoutes from './comment.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/projects', projectRoutes);
apiRoutes.use('/tasks', taskRoutes);
apiRoutes.use('/dashboard', dashboardRoutes);
apiRoutes.use('/', commentRoutes);
apiRoutes.use('/notifications', notificationRoutes);
apiRoutes.use('/admin', adminRoutes);

export default apiRoutes;
