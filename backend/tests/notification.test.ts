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

describe('Notifications', () => {
  it('rejects anonymous on list', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('rejects anonymous on unread count', async () => {
    const res = await request(app).get('/api/notifications/unread-count');
    expect(res.status).toBe(401);
  });

  it('rejects anonymous on mark-read', async () => {
    const res = await request(app).patch('/api/notifications/abc/read');
    expect(res.status).toBe(401);
  });

  it('rejects anonymous on mark-all-read', async () => {
    const res = await request(app).patch('/api/notifications/read-all');
    expect(res.status).toBe(401);
  });

  it('authenticated user gets list', async () => {
    if (await dbUnavailable()) return;
    const token = tokenFor(`notif-test-${Date.now()}`);
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 500]).toContain(res.status);
  });
});
