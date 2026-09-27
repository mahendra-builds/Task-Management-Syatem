import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { ok, paginated } from '../utils/response';
import { unauthorized } from '../middleware/errorHandler';

export const taskController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await taskService.list(req.user.id, req.query as never);
    res.json(paginated(result.items, result.total, result.page, result.pageSize));
  },

  async getOne(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const task = await taskService.getById(req.user.id, req.params.id);
    res.json(ok(task));
  },

  async create(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const task = await taskService.create(req.user.id, req.body);
    res.status(201).json(ok(task));
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const task = await taskService.update(req.user.id, req.params.id, req.body);
    res.json(ok(task));
  },

  async updateStatus(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const task = await taskService.updateStatus(req.user.id, req.params.id, req.body.status);
    res.json(ok(task));
  },

  async assign(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const task = await taskService.assign(req.user.id, req.params.id, req.body.assignedToId);
    res.json(ok(task));
  },

  async delete(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await taskService.delete(req.user.id, req.params.id);
    res.json(ok(result));
  },
};
