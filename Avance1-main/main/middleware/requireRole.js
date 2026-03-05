/**
 * requireRole('admin') o requireRole('admin','user')
 * Asume que `auth` ya estableció `req.user`.
 */

function requireRole(...allowedRoles) {
  const allowed = new Set(allowedRoles.flat().filter(Boolean));

  return (req, res, next) => {
    const role = req.user && req.user.role;

    if (!role) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (allowed.size > 0 && !allowed.has(role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
}

module.exports = requireRole;
