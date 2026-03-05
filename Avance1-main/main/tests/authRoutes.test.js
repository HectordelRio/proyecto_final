const request = require('supertest');
const express = require('express');

jest.mock('../controllers/authController', () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: 'ok' })),
  login: jest.fn((req, res) => res.json({ token: 'fake' })),
  me: jest.fn((req, res) => res.json({ username: 'hector' })),
}));

const authRoutes = require('../routes/auth');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

describe('Auth routes', () => {
  test('POST /api/auth/register devuelve 201', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'hector', email: 'h@example.com', password: '123456' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'ok');
  });

  test('POST /api/auth/login devuelve token', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'hector', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
