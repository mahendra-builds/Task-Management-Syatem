import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { Role } from '../src/types/enums';

const app = createApp();
const uniqueId = () => `task-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const tokenFor = (id: string, role: Role = Role.MEMBER) =>
  signAccessToken({ sub: id, email: `${id}@example.com`, role });

const dbUnavailable = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return false;
  } catch {
    return true;
  }
};

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
});

describe('Task endpoints', () => {
  describe('GET /api/tasks', () => {
    it('rejects anonymous requests', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });

    it('rejects invalid status', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .get('/api/tasks?status=NOT_A_STATUS')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('rejects invalid priority', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .get('/api/tasks?priority=WHATEVER')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/tasks', () => {
    it('rejects empty title', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '', projectId: 'p1' });
      expect(res.status).toBe(400);
    });

    it('rejects missing projectId', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Some task' });
      expect(res.status).toBe(400);
    });

    it('passes validation for valid payload', async () => {
      if (await dbUnavailable()) return;
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Task', projectId: 'p1', priority: 'HIGH' });
      expect(res.status).not.toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('rejects invalid status', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .patch(`/api/tasks/${uniqueId()}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'FLYING' });
      expect(res.status).toBe(400);
    });

    it('accepts valid status', async () => {
      if (await dbUnavailable()) return;
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .patch(`/api/tasks/${uniqueId()}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' });
      expect(res.status).not.toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id/assign', () => {
    it('rejects empty assignee object', async () => {
      const token = tokenFor(uniqueId());
      const res = await request(app)
        .patch(`/api/tasks/${uniqueId()}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });
});
