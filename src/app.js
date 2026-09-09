const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');

const app = express();

// Security Middlewares
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Use helmet but allow images/resources from common sources (like unsplash)
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with Vue/Leaflet inline scripts and external images
    crossOriginEmbedderPolicy: false
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
});

// Middlewares
app.use(cors());
app.use(express.json());

// Apply rate limiter to /api/auth routes
app.use('/api/auth', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Static files (Frontend)
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d',
    etag: true
}));

// Catch-all route for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
