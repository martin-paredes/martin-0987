import request from 'supertest';
import { expect, test, vi } from 'vitest';
import { app } from './app.js';

test('GET /api/health returns the application status', async () => {
  const response = await request(app).get('/api/health');

  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toMatch(/json/);
  expect(response.body).toEqual({ status: 'ok' });
});

test.each(['', 'http://localhost:5173'])('allows JSON payment preflight with CORS_ORIGIN=%s and no credentials', async (origin) => {
  vi.stubEnv('CORS_ORIGIN', origin);
  vi.resetModules();
  try {
    const { app: configuredApp } = await import('./app.js');
    const response = await request(configuredApp).options('/api/payments')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(origin || '*');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-headers']).toContain('content-type');
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
    if (origin) {
      const otherOrigin = await request(configuredApp).get('/api/health').set('Origin', 'http://other.example.test');
      expect(otherOrigin.headers['access-control-allow-origin']).toBe(origin);
    }
  } finally {
    vi.unstubAllEnvs();
    vi.resetModules();
  }
});
