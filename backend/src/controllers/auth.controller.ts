import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ok } from '../utils/response';
import { badRequest, unauthorized } from '../middleware/errorHandler';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(ok(result));
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(ok(result));
  },

  async logout(_req: Request, res: Response) {
    const result = await authService.logout();
    res.json(ok(result));
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw unauthorized();
    const user = await authService.me(req.user.id);
    if (!user) throw badRequest('User no longer exists');
    res.json(ok(user));
  },
};
