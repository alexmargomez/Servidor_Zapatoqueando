const express = require('express');
const streetController = require('../controllers/streetController');

const router = express.Router();

router.get('/', streetController.getStreets);

module.exports = router;
