import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { ok, paginated } from '../utils/response';
import { unauthorized } from '../middleware/errorHandler';

export const projectController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await projectService.list(req.user.id, req.query as never);
    res.json(
      paginated(result.items, result.total, result.page, result.pageSize),
    );
  },

  async getOne(req: Request, res: Response) {
    const project = await projectService.getById(req.params.id);
    res.json(ok(project));
  },

  async create(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const project = await projectService.create(req.user.id, req.body);
    res.status(201).json(ok(project));
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const project = await projectService.update(req.user.id, req.params.id, req.body);
    res.json(ok(project));
  },

  async delete(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await projectService.delete(req.user.id, req.params.id);
    res.json(ok(result));
  },

  async addMember(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const member = await projectService.addMember(
      req.user.id,
      req.params.id,
      req.body.userId,
      req.body.role,
    );
    res.status(201).json(ok(member));
  },

  async removeMember(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await projectService.removeMember(
      req.user.id,
      req.params.id,
      req.params.userId,
    );
    res.json(ok(result));
  },
};
