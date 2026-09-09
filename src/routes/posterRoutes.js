const express = require('express');
const posterController = require('../controllers/posterController');

const router = express.Router();
const verifyToken = require('./authMiddleware');

router.get('/', posterController.getPosters);
router.post('/', verifyToken, posterController.createPoster);
router.put('/:id', verifyToken, posterController.updatePoster);
router.delete('/:id', verifyToken, posterController.deletePoster);

module.exports = router;
