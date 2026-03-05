const Employee = require('../models/Employee');

function toInt(value, fallback) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listEmployees(req, res) {
  const queryParams = req.query || {};
  const filter = { active: true };

  if (queryParams.q !== undefined && String(queryParams.q).trim()) {
    filter.name = { $regex: escapeRegex(String(queryParams.q).trim()), $options: 'i' };
  }

  const page = queryParams.page !== undefined ? toInt(queryParams.page, 1) : null;
  const limit = queryParams.limit !== undefined ? toInt(queryParams.limit, 10) : null;

  if (page && limit) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Employee.countDocuments(filter),
      (async () => {
        let query = Employee.find(filter).sort({ name: 1 }).skip(skip).limit(limit);
        if (query && typeof query.populate === 'function') {
          query = query.populate('userId', 'username email role');
        }
        return query;
      })(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.json({ items, page, limit, total, totalPages });
  }

  let query = Employee.find(filter).sort({ name: 1 });
  if (query && typeof query.populate === 'function') {
    query = query.populate('userId', 'username email role');
  }
  const employees = await query;
  return res.json(employees);
}

async function createEmployee(req, res) {
  const { name, userId } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  try {
    const employee = await Employee.create({
      name: String(name).trim(),
      userId: userId || undefined,
    });
    res.status(201).json(employee);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Ese empleado ya existe' });
    }
    throw error;
  }
}

async function updateEmployee(req, res) {
  const { name, active, userId } = req.body;

  const update = {};
  if (name !== undefined) update.name = String(name).trim();
  if (active !== undefined) update.active = !!active;
   if (userId !== undefined) update.userId = userId || undefined;

  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!employee) return res.status(404).json({ error: 'Empleado no encontrado' });

    res.json(employee);
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Ese empleado ya existe' });
    }
    throw error;
  }
}

async function deactivateEmployee(req, res) {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );

  if (!employee) return res.status(404).json({ error: 'Empleado no encontrado' });

  res.json({ message: 'Empleado desactivado' });
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
};
