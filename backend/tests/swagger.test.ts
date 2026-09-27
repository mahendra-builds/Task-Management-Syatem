import { swaggerSpec } from '../src/config/swagger';

describe('Swagger spec', () => {
  const spec = swaggerSpec as {
    openapi: string;
    info: { title: string };
    paths: Record<string, unknown>;
    components: { securitySchemes: Record<string, unknown> };
  };

  it('has openapi version', () => {
    expect(spec.openapi).toBe('3.0.3');
  });

  it('has title', () => {
    expect(spec.info.title).toBe('Task Management System API');
  });

  it('discovers paths from route files', () => {
    const paths = Object.keys(spec.paths ?? {});
    expect(paths.length).toBeGreaterThan(0);
    // eslint-disable-next-line no-console
    console.log('Discovered paths:', paths.length, paths.slice(0, 5));
  });

  it('defines bearerAuth security scheme', () => {
    expect(spec.components?.securitySchemes?.bearerAuth).toBeDefined();
  });
});
