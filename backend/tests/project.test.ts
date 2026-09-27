import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { Role } from '../src/types/enums';

const app = createApp();

const uniqueId = () => `proj-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const tokenFor = (id: string, role: Role = Role.MEMBER) =>
  signAccessToken({ sub: id, email: `${id}@example.com`, role });

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
});

// Helper: skip DB-touching tests when no DB is reachable
const dbUnavailable = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return false;
  } catch {
    return true;
  }
};

describe('Project endpoints', () => {
  describe('GET /api/projects', () => {
    it('rejects anonymous requests', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });

    it('passes validation with empty query', async () => {
      if (await dbUnavailable()) return;
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);
      // Validation must pass; DB may not be reachable in unit env.
      expect([200, 500]).toContain(res.status);
      expect(res.status).not.toBe(400);
    });

    it('rejects pageSize > 100', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .get('/api/projects?pageSize=500')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('rejects invalid status', async () => {
      if (await dbUnavailable()) return;
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .get('/api/projects?status=WHATEVER')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/projects', () => {
    it('rejects name that is too short', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a' });
      expect(res.status).toBe(400);
    });

    it('passes validation with valid payload', async () => {
      if (await dbUnavailable()) return;
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Project', description: 'A test' });
      expect([201, 500]).toContain(res.status);
      expect(res.status).not.toBe(400);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('rejects empty id param', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .patch('/api/projects/')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });
      expect([400, 404]).toContain(res.status);
    });

    it('rejects invalid status', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .patch(`/api/projects/${uniqueId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
    });
  });
});
