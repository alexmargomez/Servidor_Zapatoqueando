import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const CACHE_DIR = path.resolve(process.cwd(), 'public/map-cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export class TileController {
  getTile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { z, x, y } = req.params;
      const tileDir = path.join(CACHE_DIR, z, x);
      const filePath = path.join(tileDir, y);

      if (fs.existsSync(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(filePath);
        return;
      }

      const yNumber = y.replace('.jpg', '');
      const googleUrl = `http://mt0.google.com/vt/lyrs=s&hl=es&x=${x}&y=${yNumber}&z=${z}`;

      const response = await axios({
        method: 'get',
        url: googleUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 5000,
      });

      if (!fs.existsSync(tileDir)) {
        fs.mkdirSync(tileDir, { recursive: true });
      }

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(filePath);
      });

      writer.on('error', (err) => {
        console.error(`[TileProxy] Error guardando tile ${z}/${x}/${y}:`, err);
        res.redirect(googleUrl);
      });
    } catch (error: any) {
      console.error(`[TileProxy] Error descargando tile:`, error?.message);
      const yNumber = (req.params.y || '').replace('.jpg', '');
      const googleUrl = `http://mt0.google.com/vt/lyrs=s&hl=es&x=${req.params.x}&y=${yNumber}&z=${req.params.z}`;
      res.redirect(googleUrl);
    }
  };
}
