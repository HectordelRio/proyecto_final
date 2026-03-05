const Activity = require('../models/Activity');
const Employee = require('../models/Employee');
const User = require('../models/User');

async function resolveAssigneeEmployeeId(assigneeUserId) {
  if (assigneeUserId === undefined) return undefined;

  const raw = String(assigneeUserId || '').trim();
  if (!raw) return undefined;

  let employee = null;

  const user = await User.findById(raw).lean();
  if (user) {
    employee = await Employee.findOne({ userId: user._id, active: true });
    if (!employee) {
      const name = user.username || `Empleado ${user._id.toString().slice(-4)}`;
      employee = await Employee.create({ name, userId: user._id });
    }
  } else {
    employee = await Employee.findById(raw);
  }

  return employee ? employee._id : null;
}

function toInt(value, fallback) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listActivities(req, res) {
  const query = req.query || {};
  const filter = {};

  const isAdmin = req.user && req.user.role === 'admin';
  const wantsAll = String(query.all || '') === '1' || String(query.all || '') === 'true';
  if (!isAdmin || !wantsAll) {
    if (req.user && req.user.id) {
      filter.userId = req.user.id;
    }
  }

  if (query.done !== undefined) {
    const v = String(query.done).toLowerCase();
    if (v === 'true' || v === '1') filter.done = true;
    if (v === 'false' || v === '0') filter.done = false;
  }

  if (query.importance !== undefined) {
    filter.importance = String(query.importance);
  }

  if (query.assigneeId !== undefined && String(query.assigneeId).trim()) {
    filter.assigneeId = String(query.assigneeId);
  }

  if (query.q !== undefined && String(query.q).trim()) {
    filter.title = { $regex: escapeRegex(String(query.q).trim()), $options: 'i' };
  }

  const page = query.page !== undefined ? toInt(query.page, 1) : null;
  const limit = query.limit !== undefined ? toInt(query.limit, 10) : null;

  if (page && limit) {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Activity.countDocuments(filter),
      Activity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assigneeId', 'name'),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.json({ items, page, limit, total, totalPages });
  }

  const activities = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .populate('assigneeId', 'name');

  return res.json(activities);
}

// Lista las actividades asignadas al empleado vinculado al usuario autenticado
async function listAssignedToMe(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const employee = await Employee.findOne({ userId: req.user.id, active: true });
  if (!employee) {
    return res.json([]);
  }

  const activities = await Activity.find({ assigneeId: employee._id })
    .sort({ createdAt: -1 })
    .populate('assigneeId', 'name');

  return res.json(activities);
}

async function createActivity(req, res) {
  const { title, importance, assigneeId, assigneeUserId } = req.body;

  const isAdmin = req.user && req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ error: 'Solo un administrador puede crear actividades' });
  }

  if (!title) {
    return res.status(400).json({ error: 'El título es requerido' });
  }
  let finalAssigneeId = assigneeId || undefined;

  // Si viene assigneeUserId, intentamos resolverlo SIEMPRE a un empleado.
  // 1) Primero lo interpretamos como un User._id y buscamos/creamos Employee ligado.
  // 2) Si no existe ese usuario, probamos a interpretarlo como Employee._id directo.
  if (!finalAssigneeId && assigneeUserId) {
    let employee = null;

    // Importante: asegurarnos de que usamos el ObjectId correcto del usuario
    const user = await User.findById(assigneeUserId).lean();
    if (user) {
      employee = await Employee.findOne({ userId: user._id, active: true });
      if (!employee) {
        const name = user.username || `Empleado ${user._id.toString().slice(-4)}`;
        employee = await Employee.create({ name, userId: user._id });
      }
    } else {
      // Fallback: por si el frontend envía directamente el id del empleado
      employee = await Employee.findById(assigneeUserId);
    }

    if (employee) {
      finalAssigneeId = employee._id;
    }
  }

  const activity = await Activity.create({
    title,
    importance: importance || 'media',
    assigneeId: finalAssigneeId,
    userId: req.user && req.user.id ? req.user.id : undefined,
  });

  const created = await Activity.findById(activity._id).populate('assigneeId', 'name');
  res.status(201).json(created);
}

async function getActivity(req, res) {
  const isAdmin = req.user && req.user.role === 'admin';
  let filter;

  if (isAdmin) {
    filter = { _id: req.params.id };
  } else {
    const ors = [{ userId: req.user.id }];

    const employee = await Employee.findOne({ userId: req.user.id, active: true });
    if (employee) {
      ors.push({ assigneeId: employee._id });
    }

    filter = { _id: req.params.id, $or: ors };
  }

  const activity = await Activity.findOne(filter).populate('assigneeId', 'name');
  if (!activity) {
    return res.status(404).json({ error: 'Actividad no encontrada' });
  }

  return res.json(activity);
}

async function updateActivity(req, res) {
  const { title, importance, done, assigneeId, assigneeUserId } = req.body;
  const isAdmin = req.user && req.user.role === 'admin';

  const update = {};

  if (isAdmin) {
    if (title !== undefined) update.title = title;
    if (importance !== undefined) update.importance = importance;
    if (done !== undefined) update.done = done;
    if (assigneeId !== undefined) {
      update.assigneeId = assigneeId || undefined;
    } else if (assigneeUserId !== undefined) {
      const raw = String(assigneeUserId || '').trim();
      if (!raw) {
        update.assigneeId = undefined;
      } else {
        const resolved = await resolveAssigneeEmployeeId(raw);
        if (!resolved) {
          return res.status(400).json({ error: 'Usuario asignado inválido' });
        }
        update.assigneeId = resolved;
      }
    }
  } else {
    // Un usuario no admin solo puede marcar la actividad como hecha / no hecha
    if (done === undefined) {
      return res.status(403).json({ error: 'Solo puedes actualizar el estado "done" de la actividad' });
    }
    update.done = done;
  }

  let filter;
  if (isAdmin) {
    filter = { _id: req.params.id };
  } else {
    const ors = [{ userId: req.user.id }];

    const employee = await Employee.findOne({ userId: req.user.id, active: true });
    if (employee) {
      ors.push({ assigneeId: employee._id });
    }

    filter = { _id: req.params.id, $or: ors };
  }

  const activity = await Activity.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
  }).populate('assigneeId', 'name');

  if (!activity) {
    return res.status(404).json({ error: 'Actividad no encontrada' });
  }

  res.json(activity);
}

async function deleteActivity(req, res) {
  const isAdmin = req.user && req.user.role === 'admin';
  if (!isAdmin) {
    return res.status(403).json({ error: 'Solo un administrador puede eliminar actividades' });
  }
  const filter = isAdmin
    ? { _id: req.params.id }
    : { _id: req.params.id, userId: req.user.id };

  const activity = await Activity.findOneAndDelete(filter);

  if (!activity) {
    return res.status(404).json({ error: 'Actividad no encontrada' });
  }

  res.json({ message: 'Actividad eliminada' });
}

module.exports = {
  listActivities,
  listAssignedToMe,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};
