const express = require('express');
const placeController = require('../controllers/placeController');

const router = express.Router();
const verifyToken = require('./authMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/', placeController.getPlaces);
router.post('/', verifyToken, upload.single('image'), placeController.createPlace);
router.put('/:id', verifyToken, upload.single('image'), placeController.updatePlace);
router.delete('/:id', verifyToken, placeController.deletePlace);

module.exports = router;
