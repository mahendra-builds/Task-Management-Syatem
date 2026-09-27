import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { Role } from '../src/types/enums';

const app = createApp();

const uniqueId = () => `user-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const makeToken = (id: string, role: Role = Role.MEMBER) =>
  signAccessToken({ sub: id, email: `${id}@example.com`, role });

describe('User endpoints', () => {
  afterAll(async () => {
    try {
      await prisma.$disconnect();
    } catch {
      /* ignore */
    }
  });

  describe('GET /api/users', () => {
    it('rejects anonymous requests', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('rejects non-admin members', async () => {
      const token = makeToken(uniqueId(), Role.MEMBER);
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/users/me/profile', () => {
    it('rejects empty body', async () => {
      const token = makeToken(uniqueId());
      const res = await request(app)
        .patch('/api/users/me/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('rejects invalid avatarUrl', async () => {
      const token = makeToken(uniqueId());
      const res = await request(app)
        .patch('/api/users/me/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatarUrl: 'not-a-url' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects name that is too short', async () => {
      const token = makeToken(uniqueId());
      const res = await request(app)
        .patch('/api/users/me/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'a' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/users/me/password', () => {
    it('requires current password field', async () => {
      const token = makeToken(uniqueId());
      const res = await request(app)
        .post('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'NewPass1' });
      expect(res.status).toBe(400);
    });

    it('enforces password complexity on new password', async () => {
      const token = makeToken(uniqueId());
      const res = await request(app)
        .post('/api/users/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'old', newPassword: 'weak' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/users/:id (admin)', () => {
    it('non-admins are forbidden', async () => {
      const token = makeToken(uniqueId(), Role.MEMBER);
      const res = await request(app)
        .patch(`/api/users/${uniqueId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });
      expect(res.status).toBe(403);
    });

    it('rejects invalid role', async () => {
      const token = makeToken(uniqueId(), Role.ADMIN);
      const res = await request(app)
        .patch(`/api/users/${uniqueId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'GOD_MODE' });
      expect(res.status).toBe(400);
    });
  });
});
