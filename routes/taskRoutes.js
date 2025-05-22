const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// Rutas de tareas
router.post('/', taskController.create);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

// Rutas de comentarios
router.post('/:id/comments', taskController.addComment);

// Rutas de etiquetas
router.post('/:id/tags', taskController.addTag);
router.delete('/:id/tags/:tagId', taskController.removeTag);

module.exports = router; 