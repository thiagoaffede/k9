const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);

// IMPORTANTE: Todas estas rutas de gestión de Personal son solo para ADMIN
router.use(roleMiddleware(['admin']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
