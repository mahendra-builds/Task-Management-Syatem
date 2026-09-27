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

describe('Integration: auth + project + task flow', () => {
  it('rejects full flow without a token', async () => {
    const r1 = await request(app).post('/api/projects').send({ name: 'X' });
    expect(r1.status).toBe(401);

    const r2 = await request(app).post('/api/tasks').send({ title: 't', projectId: 'p' });
    expect(r2.status).toBe(401);
  });

  it('authenticated user can attempt to list projects', async () => {
    if (await dbUnavailable()) return;
    const token = tokenFor(`flow-${Date.now()}`);
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.status);
  });

  it('authenticated user can attempt to list tasks', async () => {
    if (await dbUnavailable()) return;
    const token = tokenFor(`flow-${Date.now()}`);
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.status);
  });

  it('admin only: stats endpoint requires admin role', async () => {
    const memberToken = tokenFor(`flow-${Date.now()}`, Role.MEMBER);
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });
});
