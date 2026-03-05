jest.mock('../models/Activity', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../models/Employee', () => ({
  findOne: jest.fn(),
}));

const Activity = require('../models/Activity');
const Employee = require('../models/Employee');
const controller = require('../controllers/activityController');

function createRes() {
  return {
    status: jest.fn(function status(code) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(),
  };
}

describe('activityController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Employee.findOne.mockResolvedValue(null);
  });

  test('listActivities: filters by req.user.id and returns populated list', async () => {
    const req = { user: { id: 'user1' } };
    const res = createRes();

    const populate = jest.fn().mockResolvedValue([{ _id: 'a1' }]);
    const sort = jest.fn(() => ({ populate }));
    Activity.find.mockReturnValue({ sort });

    await controller.listActivities(req, res);

    expect(Activity.find).toHaveBeenCalledWith({ userId: 'user1' });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(populate).toHaveBeenCalledWith('assigneeId', 'name');
    expect(res.json).toHaveBeenCalledWith([{ _id: 'a1' }]);
  });

  test('createActivity: 400 when title missing', async () => {
    const req = { body: { importance: 'media' }, user: { id: 'u1', role: 'admin' } };
    const res = createRes();

    await controller.createActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El título es requerido' });
  });

  test('createActivity: creates and returns populated doc', async () => {
    const req = { body: { title: 't', importance: 'alta', assigneeId: 'e1' }, user: { id: 'u1', role: 'admin' } };
    const res = createRes();

    Activity.create.mockResolvedValue({ _id: 'a1' });
    Activity.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: 'a1', title: 't' }) });

    await controller.createActivity(req, res);

    expect(Activity.create).toHaveBeenCalledWith({
      title: 't',
      importance: 'alta',
      assigneeId: 'e1',
      userId: 'u1',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: 'a1', title: 't' });
  });

  test('updateActivity: 404 when activity not found', async () => {
    const req = { params: { id: 'a1' }, body: { done: true }, user: { id: 'u1' } };
    const res = createRes();

    Activity.findOneAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

    await controller.updateActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Actividad no encontrada' });
  });

  test('deleteActivity: 404 when not found', async () => {
    const req = { params: { id: 'a1' }, user: { id: 'u1', role: 'admin' } };
    const res = createRes();

    Activity.findOneAndDelete.mockResolvedValue(null);

    await controller.deleteActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Actividad no encontrada' });
  });

  test('createActivity: 403 for non-admin user', async () => {
    const req = { body: { title: 't', importance: 'media' }, user: { id: 'u1', role: 'user' } };
    const res = createRes();

    await controller.createActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Solo un administrador puede crear actividades' });
  });
});
