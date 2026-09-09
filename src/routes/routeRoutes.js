const express = require('express');
const routeController = require('../controllers/routeController');

const router = express.Router();
const verifyToken = require('./authMiddleware');

router.get('/', routeController.getRoutes);
router.post('/', verifyToken, routeController.createRoute);
router.put('/:id', verifyToken, routeController.updateRoute);
router.delete('/:id', verifyToken, routeController.deleteRoute);

module.exports = router;
