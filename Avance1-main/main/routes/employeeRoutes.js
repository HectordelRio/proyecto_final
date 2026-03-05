const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const employeeController = require('../controllers/employeeController');
const validate = require('../middleware/validate');

const router = express.Router();

// Listar empleados (protegido) – cualquier usuario autenticado
router.get('/', auth, (req, res, next) => employeeController.listEmployees(req, res).catch(next));

// Crear empleado (solo admin)
router.post(
	'/',
	auth,
	requireRole('admin'),
	validate((req) => {
		const { name, userId } = req.body || {};
		if (!name || !String(name).trim()) {
			return { status: 400, body: { error: 'El nombre es requerido' } };
		}
		if (userId !== undefined && userId !== null && typeof userId !== 'string') {
			return { status: 400, body: { error: 'userId inválido' } };
		}
		return null;
	}),
	(req, res, next) => employeeController.createEmployee(req, res).catch(next)
);

// Editar empleado (solo admin)
router.put(
	'/:id',
	auth,
	requireRole('admin'),
	validate((req) => {
		const { name, active, userId } = req.body || {};

		if (name !== undefined && typeof name !== 'string') {
			return { status: 400, body: { error: 'name inválido' } };
		}

		if (active !== undefined && typeof active !== 'boolean') {
			return { status: 400, body: { error: 'active inválido' } };
		}

		if (userId !== undefined && userId !== null && typeof userId !== 'string') {
			return { status: 400, body: { error: 'userId inválido' } };
		}

		return null;
	}),
	(req, res, next) => employeeController.updateEmployee(req, res).catch(next)
);

// "Eliminar" empleado = desactivar (solo admin)
router.delete(
	'/:id',
	auth,
	requireRole('admin'),
	(req, res, next) => employeeController.deactivateEmployee(req, res).catch(next)
);

module.exports = router;
