import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('API documentation', () => {
  it('serves OpenAPI JSON spec', async () => {
    const res = await request(app).get('/api/docs/json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeDefined();
    expect(res.body.info.title).toBe('Task Management System API');
    expect(res.body.components.securitySchemes.bearerAuth).toBeDefined();
  });

  it('serves Swagger UI HTML', async () => {
    const res = await request(app).get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Task Management API');
    expect(res.text).toContain('swagger-ui');
  });

  it('exposes tag definitions', async () => {
    const res = await request(app).get('/api/docs/json');
    const tags = res.body.tags.map((t: { name: string }) => t.name);
    expect(tags).toEqual(
      expect.arrayContaining([
        'Auth', 'Users', 'Projects', 'Tasks', 'Comments', 'Activity', 'Notifications', 'Dashboard', 'Admin', 'Health',
      ]),
    );
  });
});
