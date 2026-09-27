import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface PrismaKnownError {
  code?: string;
  meta?: Record<string, unknown>;
}
const isPrismaKnownError = (e: unknown): e is PrismaKnownError =>
  typeof e === 'object' && e !== null && 'code' in e && typeof (e as { code: unknown }).code === 'string';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(message, 400, 'BAD_REQUEST', details);
export const unauthorized = (message = 'Unauthorized') =>
  new AppError(message, 401, 'UNAUTHORIZED');
export const forbidden = (message = 'Forbidden') => new AppError(message, 403, 'FORBIDDEN');
export const notFound = (message = 'Resource not found') =>
  new AppError(message, 404, 'NOT_FOUND');
export const conflict = (message: string, details?: unknown) =>
  new AppError(message, 409, 'CONFLICT', details);

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (isPrismaKnownError(err)) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Unique constraint violation',
        code: 'UNIQUE_VIOLATION',
        meta: err.meta,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Resource not found',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  console.error('[errorHandler]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
