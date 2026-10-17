const express = require('express');
const placeController = require('../controllers/placeController');

const router = express.Router();
const verifyToken = require('./authMiddleware');

const multer = require('multer');
const path = require('path');

const fs = require('fs');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
