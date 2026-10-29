import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { TileCoordinateVO } from '../../domain/value-objects/tile-coordinate.vo';
import { InvalidUploadException } from '../../domain/exceptions/invalid-upload.exception';

const CACHE_DIR = path.resolve(process.cwd(), 'public/map-cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export class TileController {
  getTile = async (req: Request, res: Response): Promise<void> => {
    let tileCoord: TileCoordinateVO;
    try {
      tileCoord = new TileCoordinateVO(
        String(req.params.z || ''),
        String(req.params.x || ''),
        String(req.params.y || '')
      );
    } catch (err) {
      if (err instanceof InvalidUploadException) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(400).json({ error: 'Coordenadas de tesela inválidas.' });
      return;
    }

    const googleUrl = tileCoord.getUpstreamSatelliteUrl();

    try {
      const tileDir = path.join(CACHE_DIR, String(tileCoord.z), String(tileCoord.x));
      const filePath = path.join(tileDir, tileCoord.fileName);

      if (fs.existsSync(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(filePath);
        return;
      }

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
        console.error(`[TileProxy] Error guardando tile ${tileCoord.z}/${tileCoord.x}/${tileCoord.fileName}:`, err);
        res.redirect(googleUrl);
      });
    } catch (error: any) {
      console.error(`[TileProxy] Error descargando tile:`, error?.message);
      res.redirect(googleUrl);
    }
  };
}
