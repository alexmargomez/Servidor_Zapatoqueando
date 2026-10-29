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
  /**
   * Mapa SingleFlight de descargas en curso para evitar condiciones de carrera
   * cuando múltiples clientes piden simultáneamente la misma tesela fría.
   */
  private static readonly inFlightDownloads = new Map<string, Promise<Buffer>>();

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
    const tileDir = path.join(CACHE_DIR, String(tileCoord.z), String(tileCoord.x));
    const filePath = path.join(tileDir, tileCoord.fileName);

    try {
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(filePath);
        return;
      } catch {
        // Cache miss: continuar a descarga SingleFlight
      }

      let downloadPromise = TileController.inFlightDownloads.get(tileCoord.cacheKey);
      if (!downloadPromise) {
        downloadPromise = this.fetchAndPersistTileAtomically(googleUrl, tileDir, filePath).finally(() => {
          TileController.inFlightDownloads.delete(tileCoord.cacheKey);
        });
        TileController.inFlightDownloads.set(tileCoord.cacheKey, downloadPromise);
      }

      const imageBuffer = await downloadPromise;
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } catch (error: any) {
      console.error(`[TileProxy] Error descargando tile ${tileCoord.cacheKey}:`, error?.message);
      res.redirect(googleUrl);
    }
  };

  private async fetchAndPersistTileAtomically(
    upstreamUrl: string,
    tileDir: string,
    filePath: string
  ): Promise<Buffer> {
    const response = await axios.get<ArrayBuffer>(upstreamUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 5000,
    });

    const buffer = Buffer.from(response.data);
    if (!TileCoordinateVO.isValidImageMagicBytes(buffer)) {
      throw new Error('Upstream response did not contain valid JPEG/PNG magic bytes.');
    }

    await fs.promises.mkdir(tileDir, { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tmpPath, buffer);
    await fs.promises.rename(tmpPath, filePath);
    return buffer;
  }
}
