import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { Role } from '../src/types/enums';

const app = createApp();
const tokenFor = (id: string, role: Role = Role.MEMBER) =>
  signAccessToken({ sub: id, email: `${id}@example.com`, role });

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }
});

describe('Comments & activity', () => {
  describe('POST /api/tasks/:taskId/comments', () => {
    it('rejects empty content', async () => {
      const token = tokenFor(`comment-test-${Date.now()}`);
      const res = await request(app)
        .post(`/api/tasks/some-task/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });
      expect(res.status).toBe(400);
    });

    it('rejects too-long content', async () => {
      const token = tokenFor(`comment-test-${Date.now()}`);
      const res = await request(app)
        .post(`/api/tasks/some-task/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'a'.repeat(5001) });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:taskId/comments/:commentId', () => {
    it('rejects empty content', async () => {
      const token = tokenFor(`comment-test-${Date.now()}`);
      const res = await request(app)
        .patch(`/api/tasks/some-task/comments/some-comment`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks/:taskId/activity', () => {
    it('rejects anonymous', async () => {
      const res = await request(app).get('/api/tasks/some-task/activity');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/projects/:projectId/activity', () => {
    it('rejects anonymous', async () => {
      const res = await request(app).get('/api/projects/some-project/activity');
      expect(res.status).toBe(401);
    });
  });
});
