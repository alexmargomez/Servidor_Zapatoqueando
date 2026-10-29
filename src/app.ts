import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './shared/infrastructure/http/routes/api.routes';
import { tileRouter } from './modules/uploads/infrastructure/routes/tile.routes';

export const app = express();

// Trust Reverse Proxy (Nginx / Cloudflare / Caddy)
app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());

// Rate Limiting for Auth/API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos',
});

// Logger para depurar peticiones entrantes
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} | Content-Type: ${req.headers['content-type']}`);
  next();
});
app.use(express.json());

// Apply rate limiter to /api/auth routes
app.use('/api/auth', apiLimiter);

// API Routes (Hexagonal Modules)
app.use('/api', apiRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint de API no encontrado.' });
});

const publicDir = path.resolve(process.cwd(), 'public');

// Static files (Frontend)
app.use(
  express.static(publicDir, {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

// Fallback para caché de mapas
app.use('/map-cache', tileRouter);

// Catch-all route for SPA routing
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global Error Handler (Multer / DomainException -> JSON 400 en vez de HTML 500)
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = typeof err?.statusCode === 'number' ? err.statusCode : 400;
    res.status(status).json({
      error: err?.message || 'Error procesando la solicitud.',
    });
  }
);

export default app;
