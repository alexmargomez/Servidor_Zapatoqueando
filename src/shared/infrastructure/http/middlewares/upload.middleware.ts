import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Lista blanca estricta de formatos de imagen rasterizados seguros.
 * Bloquea explícitamente image/svg+xml (Stored XSS) y extensiones ejecutables (.html, .js, .php).
 */
export const SAFE_IMAGE_MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeExt = SAFE_IMAGE_MIME_EXTENSIONS[file.mimetype.toLowerCase()] || '.jpg';
    cb(null, `${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const normalizedMime = (file.mimetype || '').toLowerCase();
  if (Object.prototype.hasOwnProperty.call(SAFE_IMAGE_MIME_EXTENSIONS, normalizedMime)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido. Solo se aceptan JPEG, PNG, WEBP o GIF.'));
  }
};

export const uploadImageMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
