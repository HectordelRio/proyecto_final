const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
}));

const User = require('../models/User');
const authController = require('../controllers/authController');

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('register devuelve 201 cuando el registro es correcto', async () => {
    const req = {
      body: { username: 'hector', email: 'hector@example.com', password: '123456' },
    };
    const res = createMockResponse();

    User.findOne.mockResolvedValue(null);
    User.countDocuments.mockResolvedValue(1);
    User.create.mockResolvedValue({ _id: '1', username: 'hector', email: 'hector@example.com' });

    await authController.register(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('username', 'hector');
  });

  test('login devuelve token cuando las credenciales son válidas', async () => {
    const req = {
      body: { username: 'hector', password: '123456' },
    };
    const res = createMockResponse();

    const fakeUser = {
      _id: '1',
      username: 'hector',
      password: 'hashed',
      role: 'user',
    };

    User.findOne.mockResolvedValue(fakeUser);

    await authController.login(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('username', 'hector');
    expect(res.body).toHaveProperty('role', 'user');
  });
});
