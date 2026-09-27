import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { ok, paginated } from '../utils/response';

export const adminController = {
  async stats(_req: Request, res: Response) {
    const stats = await adminService.stats();
    res.json(ok(stats));
  },

  async listAllProjects(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const status = req.query.status as string | undefined;
    const q = req.query.q as string | undefined;
    const result = await adminService.listAllProjects({ page, pageSize, status, q });
    res.json(paginated(result.items, result.total, result.page, result.pageSize));
  },

  async listAllTasks(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const q = req.query.q as string | undefined;
    const result = await adminService.listAllTasks({ page, pageSize, status, priority, q });
    res.json(paginated(result.items, result.total, result.page, result.pageSize));
  },
};
