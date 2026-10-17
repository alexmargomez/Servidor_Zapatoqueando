"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api_routes_1 = require("./shared/infrastructure/http/routes/api.routes");
const tile_routes_1 = require("./modules/uploads/infrastructure/routes/tile.routes");
exports.app = (0, express_1.default)();
// Trust Reverse Proxy (Nginx / Cloudflare / Caddy)
exports.app.set('trust proxy', 1);
// Security Middlewares
exports.app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
exports.app.use((0, cors_1.default)());
// Rate Limiting for Auth/API
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos',
});
// Logger para depurar peticiones entrantes
exports.app.use((req, _res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} | Content-Type: ${req.headers['content-type']}`);
    next();
});
exports.app.use(express_1.default.json());
// Apply rate limiter to /api/auth routes
exports.app.use('/api/auth', apiLimiter);
// API Routes (Hexagonal Modules)
exports.app.use('/api', api_routes_1.apiRouter);
const publicDir = path_1.default.resolve(process.cwd(), 'public');
// Static files (Frontend)
exports.app.use(express_1.default.static(publicDir, {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    },
}));
// Fallback para caché de mapas
exports.app.use('/map-cache', tile_routes_1.tileRouter);
// Catch-all route for SPA routing
exports.app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path_1.default.join(publicDir, 'index.html'));
});
exports.default = exports.app;
