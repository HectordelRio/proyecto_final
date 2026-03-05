const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No hay token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const user = await User.findById(decoded.id).select('role username email').lean();
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = {
      id: String(user._id),
      role: user.role || 'user',
      username: user.username,
      email: user.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;
