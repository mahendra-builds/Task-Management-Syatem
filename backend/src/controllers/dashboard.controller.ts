import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { ok } from '../utils/response';
import { unauthorized } from '../middleware/errorHandler';

export const dashboardController = {
  async get(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const data = await dashboardService.getDashboard(req.user.id);
    res.json(ok(data));
  },
};
