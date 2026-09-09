const express = require('express');
const posterController = require('../controllers/posterController');

const router = express.Router();

router.get('/', posterController.getPosters);

module.exports = router;
