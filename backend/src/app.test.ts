import request from 'supertest';
import { expect, test } from 'vitest';
import { app } from './app.js';

test('GET /api/health returns the application status', async () => {
  const response = await request(app).get('/api/health');

  expect(response.status).toBe(200);
  expect(response.headers['content-type']).toMatch(/json/);
  expect(response.body).toEqual({ status: 'ok' });
});
