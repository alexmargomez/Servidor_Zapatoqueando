const express = require('express');
const uploadController = require('../controllers/uploadController');
const verifyToken = require('./authMiddleware');

const router = express.Router();

// Route to handle single image upload
router.post('/', verifyToken, uploadController.upload.single('image'), uploadController.uploadImage);

module.exports = router;
