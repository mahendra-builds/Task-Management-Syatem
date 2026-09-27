import { badRequest, notFound, AppError } from '../src/middleware/errorHandler';

describe('AppError', () => {
  it('creates an operational error with status and code', () => {
    const e = badRequest('Bad input', { field: 'email' });
    expect(e).toBeInstanceOf(AppError);
    expect(e.statusCode).toBe(400);
    expect(e.code).toBe('BAD_REQUEST');
    expect(e.message).toBe('Bad input');
    expect(e.details).toEqual({ field: 'email' });
    expect(e.isOperational).toBe(true);
  });

  it('notFound default message works', () => {
    const e = notFound();
    expect(e.statusCode).toBe(404);
    expect(e.code).toBe('NOT_FOUND');
  });
});
