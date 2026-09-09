const express = require('express');
const placeController = require('../controllers/placeController');

const router = express.Router();
const verifyToken = require('./authMiddleware');

router.get('/', placeController.getPlaces);
router.post('/', verifyToken, placeController.createPlace);
router.put('/:id', verifyToken, placeController.updatePlace);
router.delete('/:id', verifyToken, placeController.deletePlace);

module.exports = router;
