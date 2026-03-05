jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'user1', role: 'admin' };
  next();
});

jest.mock('../models/Employee', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const express = require('express');
const employeeRoutes = require('../routes/employeeRoutes');
const errorHandler = require('../middleware/errorHandler');
const Employee = require('../models/Employee');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/employees', employeeRoutes);
  app.use(errorHandler);
  return app;
}

describe('employeeRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/employees returns active employees', async () => {
    const sort = jest.fn().mockResolvedValue([{ _id: 'e1', name: 'Ana' }]);
    Employee.find.mockReturnValue({ sort });

    const request = require('supertest');
    const res = await request(createApp()).get('/api/employees');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ _id: 'e1', name: 'Ana' }]);
  });

  test('POST /api/employees 400 when missing name', async () => {
    const request = require('supertest');
    const res = await request(createApp()).post('/api/employees').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'El nombre es requerido' });
  });
});
