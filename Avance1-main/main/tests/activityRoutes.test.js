jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'user1', role: 'admin' };
  next();
});

jest.mock('../models/Activity', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const express = require('express');
const activityRoutes = require('../routes/activityRoutes');
const errorHandler = require('../middleware/errorHandler');
const Activity = require('../models/Activity');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/activities', activityRoutes);
  app.use(errorHandler);
  return app;
}

describe('activityRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/activities returns list', async () => {
    const populate = jest.fn().mockResolvedValue([{ _id: 'a1' }]);
    const sort = jest.fn(() => ({ populate }));
    Activity.find.mockReturnValue({ sort });

    const request = require('supertest');
    const res = await request(createApp()).get('/api/activities');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ _id: 'a1' }]);
  });

  test('POST /api/activities 400 when missing title', async () => {
    const request = require('supertest');
    const res = await request(createApp())
      .post('/api/activities')
      .send({ importance: 'media' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'El título es requerido' });
  });
});
