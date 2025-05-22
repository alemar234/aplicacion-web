const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

// Rutas de listas
router.post('/', listController.create);
router.get('/', listController.getLists);
router.get('/:id', listController.getList);
router.put('/:id', listController.update);
router.delete('/:id', listController.delete);
router.post('/:id/share', listController.share);

module.exports = router; 