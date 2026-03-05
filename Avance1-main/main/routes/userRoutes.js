const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');

const router = express.Router();

// Obtener todos los usuarios (protegido)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Actualizar usuario (editar datos o marcar como listo)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { username, email, isReady } = req.body;

    const update = {};
    if (username !== undefined) update.username = username;
    if (email !== undefined) update.email = email;
    if (isReady !== undefined) update.isReady = isReady;

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Actualizar role del usuario (solo admin)
router.put(
  '/:id/role',
  authMiddleware,
  requireRole('admin'),
  validate((req) => {
    const { role } = req.body || {};
    if (!role || (role !== 'admin' && role !== 'user')) {
      return { status: 400, body: { error: 'role inválido' } };
    }
    return null;
  }),
  async (req, res) => {
    try {
      const { role } = req.body;
      const updated = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar rol' });
    }
  }
);

module.exports = router;
