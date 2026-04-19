const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/register', register); // Público para simplificar inicialización
router.post('/login', login);

module.exports = router;
