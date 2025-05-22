const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

// Rutas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Rutas protegidas
router.get('/me', isAuthenticated, userController.getCurrentUser);

module.exports = router; 