const express = require('express');
const auth = require('../middleware/auth');
const activityController = require('../controllers/activityController');
const validate = require('../middleware/validate');

const router = express.Router();

// Obtener actividades (por usuario autenticado)
router.get('/', auth, (req, res, next) => activityController.listActivities(req, res).catch(next));

// Obtener actividades asignadas al usuario actual
router.get('/assigned/me', auth, (req, res, next) => activityController.listAssignedToMe(req, res).catch(next));

// Obtener una actividad por id
router.get('/:id', auth, (req, res, next) => activityController.getActivity(req, res).catch(next));

// Crear nueva actividad
router.post(
	'/',
	auth,
	validate((req) => {
		const { title, importance, assigneeId } = req.body || {};

		if (!title || !String(title).trim()) {
			return { status: 400, body: { error: 'El título es requerido' } };
		}

		const allowedImportance = new Set(['alta', 'media', 'baja']);
		if (importance !== undefined && !allowedImportance.has(String(importance))) {
			return { status: 400, body: { error: 'Importancia inválida' } };
		}

		if (assigneeId !== undefined && assigneeId !== null && typeof assigneeId !== 'string') {
			return { status: 400, body: { error: 'assigneeId inválido' } };
		}

		return null;
	}),
	(req, res, next) => activityController.createActivity(req, res).catch(next)
);

// Actualizar actividad (editar título/importancia o marcar como hecha)
router.put(
	'/:id',
	auth,
	validate((req) => {
		const { title, importance, done, assigneeId, assigneeUserId } = req.body || {};
		const hasAny =
			title !== undefined ||
			importance !== undefined ||
			done !== undefined ||
			assigneeId !== undefined ||
			assigneeUserId !== undefined;

		if (!hasAny) {
			return { status: 400, body: { error: 'No hay campos para actualizar' } };
		}

		if (title !== undefined && typeof title !== 'string') {
			return { status: 400, body: { error: 'title inválido' } };
		}

		const allowedImportance = new Set(['alta', 'media', 'baja']);
		if (importance !== undefined && !allowedImportance.has(String(importance))) {
			return { status: 400, body: { error: 'Importancia inválida' } };
		}

		if (done !== undefined && typeof done !== 'boolean') {
			return { status: 400, body: { error: 'done inválido' } };
		}

		if (assigneeId !== undefined && assigneeId !== null && typeof assigneeId !== 'string') {
			return { status: 400, body: { error: 'assigneeId inválido' } };
		}

		if (assigneeUserId !== undefined && assigneeUserId !== null && typeof assigneeUserId !== 'string') {
			return { status: 400, body: { error: 'assigneeUserId inválido' } };
		}

		return null;
	}),
	(req, res, next) => activityController.updateActivity(req, res).catch(next)
);

// Eliminar actividad
router.delete('/:id', auth, (req, res, next) => activityController.deleteActivity(req, res).catch(next));

module.exports = router;
