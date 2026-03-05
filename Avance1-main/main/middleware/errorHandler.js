/**
 * Middleware global de manejo de errores
 * Captura todos los errores y responde con JSON estructurado
 */

const errorHandler = (err, req, res, next) => {
  // Log del error en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }

  // JSON inválido (body-parser / express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  // Erro de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Validación fallida', details: messages });
  }

  // Error de duplicado en índice único
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ error: `El ${field} ya existe` });
  }

  // Error de cast en MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Errores generales
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;
