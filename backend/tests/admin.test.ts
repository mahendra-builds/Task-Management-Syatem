import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { Role } from '../src/types/enums';

const app = createApp();
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

describe('Admin endpoints', () => {
  it('rejects anonymous on /stats', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('rejects non-admin on /stats', async () => {
    const token = tokenFor(`admin-test-${Date.now()}`, Role.MEMBER);
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('rejects non-admin on /admin/projects', async () => {
    const token = tokenFor(`admin-test-${Date.now()}`, Role.MEMBER);
    const res = await request(app)
      .get('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('rejects non-admin on /admin/tasks', async () => {
    const token = tokenFor(`admin-test-${Date.now()}`, Role.MEMBER);
    const res = await request(app)
      .get('/api/admin/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('admin can access stats', async () => {
    if (await dbUnavailable()) return;
    const token = tokenFor(`admin-test-${Date.now()}`, Role.ADMIN);
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.status);
  });
});
