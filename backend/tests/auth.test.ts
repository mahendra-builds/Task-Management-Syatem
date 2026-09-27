import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';

const app = createApp();

describe('Auth validation', () => {
  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // ignore — db not reachable in unit tests
    }
  });

  describe('POST /api/auth/register', () => {
    it('rejects passwords shorter than 8 chars', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'alice@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects passwords without an uppercase letter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'alice@example.com', password: 'all-lower-1' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects malformed email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email: 'not-an-email', password: 'GoodPass1' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects empty body', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('rejects empty password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'x@example.com', password: '' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-real-jwt');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_TOKEN');
    });

    it('returns 401 when header is malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Token something');
      expect(res.status).toBe(401);
    });
  });
});
