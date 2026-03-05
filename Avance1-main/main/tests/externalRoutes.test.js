const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'u1', role: 'user' };
  next();
});

const externalRoutes = require('../routes/externalRoutes');
const errorHandler = require('../middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/external', externalRoutes);
  app.use(errorHandler);
  return app;
}

describe('externalRoutes', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('GET /api/external/convert convierte con rate', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'success',
        base_code: 'USD',
        rates: { MXN: 17.5 },
      }),
    });

    const res = await request(createApp()).get('/api/external/convert?from=USD&to=MXN&amount=2');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      from: 'USD',
      to: 'MXN',
      amount: 2,
      rate: 17.5,
      result: 35,
    });
  });

  test('GET /api/external/convert 400 si falta from/to', async () => {
    const res = await request(createApp()).get('/api/external/convert?amount=1');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'from y to son requeridos' });
  });
});
