/**
 * validate((req) => null | { status?: number, body: any })
 * Útil para validación declarativa sin duplicar lógica en controladores.
 */

function validate(validator) {
  return (req, res, next) => {
    try {
      const result = validator(req);
      if (result) {
        return res.status(result.status || 400).json(result.body);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = validate;
