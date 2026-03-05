jest.mock('../models/Employee', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const Employee = require('../models/Employee');
const controller = require('../controllers/employeeController');

function createRes() {
  return {
    status: jest.fn(function status(code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(),
  };
}

describe('employeeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listEmployees: returns active employees sorted', async () => {
    const req = {};
    const res = createRes();

    const sort = jest.fn().mockResolvedValue([{ _id: 'e1' }]);
    Employee.find.mockReturnValue({ sort });

    await controller.listEmployees(req, res);

    expect(Employee.find).toHaveBeenCalledWith({ active: true });
    expect(sort).toHaveBeenCalledWith({ name: 1 });
    expect(res.json).toHaveBeenCalledWith([{ _id: 'e1' }]);
  });

  test('createEmployee: 400 when name missing', async () => {
    const req = { body: {} };
    const res = createRes();

    await controller.createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El nombre es requerido' });
  });

  test('createEmployee: 409 on duplicate', async () => {
    const req = { body: { name: 'Ana' } };
    const res = createRes();

    Employee.create.mockRejectedValue({ code: 11000 });

    await controller.createEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ese empleado ya existe' });
  });

  test('updateEmployee: 404 when not found', async () => {
    const req = { params: { id: 'e1' }, body: { name: 'Ana' } };
    const res = createRes();

    Employee.findByIdAndUpdate.mockResolvedValue(null);

    await controller.updateEmployee(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Empleado no encontrado' });
  });
});
