const express = require('express');
const posterRoutes = require('./posterRoutes');
const placeRoutes = require('./placeRoutes');
const routeRoutes = require('./routeRoutes');
const streetRoutes = require('./streetRoutes');
const authRoutes = require('./authRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/posters', posterRoutes);
router.use('/places', placeRoutes);
router.use('/routes', routeRoutes);
router.use('/streets', streetRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
