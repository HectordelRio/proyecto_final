const express = require('express');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Registro de usuario
router.post('/register', authController.register);

// Login de usuario
router.post('/login', authController.login);

// Usuario autenticado actual (ruta protegida)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
