const request = require('supertest');
const express = require('express');

jest.mock('../models/User', () => ({
  find: jest.fn(() => ({ select: jest.fn().mockResolvedValue([{ _id: 'u1', username: 'a' }]) })),
  findByIdAndUpdate: jest.fn(() => ({ select: jest.fn().mockResolvedValue({ _id: 'u1', username: 'a' }) })),
}));

// Mock de auth: por defecto usuario regular
jest.mock('../middleware/auth', () =>
  jest.fn((req, res, next) => {
    req.user = { id: 'u1', role: 'user' };
    next();
  })
);

const userRoutes = require('../routes/userRoutes');
const errorHandler = require('../middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  app.use(errorHandler);
  return app;
}

describe('userRoutes authorization', () => {
  test('GET /api/users devuelve 403 para user regular', async () => {
    const res = await request(createApp()).get('/api/users');
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'No autorizado' });
  });

  test('GET /api/users devuelve 200 para admin', async () => {
    const auth = require('../middleware/auth');
    auth.mockImplementationOnce((req, res, next) => {
      req.user = { id: 'admin1', role: 'admin' };
      next();
    });

    const res = await request(createApp()).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
