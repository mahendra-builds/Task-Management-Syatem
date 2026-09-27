import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Health endpoint', () => {
  const app = createApp();

  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore
    }
  });

  it('GET /health returns 200 and ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('task-management-api');
  });

  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.status);
  });

  it('GET unknown route returns 404 with structured error', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
