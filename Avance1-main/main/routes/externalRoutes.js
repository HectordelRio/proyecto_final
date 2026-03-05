const express = require('express');
const auth = require('../middleware/auth');
const externalController = require('../controllers/externalController');

const router = express.Router();

// Consultar tasas (protegido)
router.get('/rates', auth, (req, res, next) => externalController.rates(req, res).catch(next));

// Conversión simple (protegido)
router.get('/convert', auth, (req, res, next) => externalController.convert(req, res).catch(next));

module.exports = router;
