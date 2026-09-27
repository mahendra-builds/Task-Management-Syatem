import { Request, Response, NextFunction } from 'express';
import { notFound } from './errorHandler';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
