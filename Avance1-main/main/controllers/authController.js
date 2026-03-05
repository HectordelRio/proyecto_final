const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro de usuario
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email y password son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Bootstrap: el primer usuario del sistema será admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      username,
      email,
      role,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Usuario registrado',
      userId: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Error en el registro' });
  }
}

// Login de usuario
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username y password son requeridos' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET no configurado' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      token,
      userId: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error en login' });
  }
}

// Datos del usuario autenticado
async function me(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

module.exports = {
  register,
  login,
  me,
};
