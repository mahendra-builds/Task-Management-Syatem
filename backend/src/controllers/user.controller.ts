import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ok } from '../utils/response';
import { Role } from '../types/enums';
import { unauthorized } from '../middleware/errorHandler';

export const userController = {
  async list(_req: Request, res: Response) {
    const users = await userService.listAll();
    res.json(ok(users));
  },

  async getOne(req: Request, res: Response) {
    const user = await userService.getById(req.params.id);
    res.json(ok(user));
  },

  async updateProfile(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json(ok(user));
  },

  async changePassword(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await userService.changePassword(req.user.id, req.body);
    res.json(ok(result));
  },

  async adminUpdate(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const user = await userService.adminUpdate(
      req.params.id,
      req.user.role as Role,
      req.body,
    );
    res.json(ok(user));
  },

  async adminDelete(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const result = await userService.adminDelete(
      req.params.id,
      req.user.id,
      req.user.role as Role,
    );
    res.json(ok(result));
  },
};
