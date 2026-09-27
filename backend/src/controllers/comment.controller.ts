import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';
import { ok, paginated } from '../utils/response';
import { Role } from '../types/enums';
import { unauthorized } from '../middleware/errorHandler';

export const commentController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const items = await commentService.listForTask(req.user.id, req.params.taskId);
    res.json(ok(items));
  },

  async create(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const comment = await commentService.create(req.user.id, req.params.taskId, req.body);
    res.status(201).json(ok(comment));
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const comment = await commentService.update(
      req.user.id,
      req.params.taskId,
      req.params.commentId,
      req.body,
    );
    res.json(ok(comment));
  },

  async delete(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await commentService.delete(
      req.user.id,
      req.params.taskId,
      req.params.commentId,
      req.user.role === Role.ADMIN,
    );
    res.json(ok(result));
  },

  async listTaskActivity(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const result = await commentService.listActivityForTask(req.params.taskId, page, pageSize);
    res.json(paginated(result.items, result.total, result.page, result.pageSize));
  },

  async listProjectActivity(req: Request, res: Response) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 50);
    const result = await commentService.listActivityForProject(req.params.projectId, page, pageSize);
    res.json(paginated(result.items, result.total, result.page, result.pageSize));
  },
};
