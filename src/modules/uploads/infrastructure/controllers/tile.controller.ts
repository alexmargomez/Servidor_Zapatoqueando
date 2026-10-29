import { Request, Response } from 'express';
import { TileCoordinateVO } from '../../domain/value-objects/tile-coordinate.vo';
import { InvalidUploadException } from '../../domain/exceptions/invalid-upload.exception';
import { TileCacheService } from '../services/tile-cache.service';

export class TileController {
  constructor(private readonly tileCacheService: TileCacheService = new TileCacheService()) {}

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
    const { filePath } = this.tileCacheService.resolveLocalPaths(tileCoord);

    try {
      if (await this.tileCacheService.hasCachedTile(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.sendFile(filePath);
        return;
      }

      const imageBuffer = await this.tileCacheService.getOrFetchTileBuffer(tileCoord);
      const mimeType =
        imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50
          ? 'image/png'
          : imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49
            ? 'image/webp'
            : 'image/jpeg';
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Content-Type', mimeType);
      res.send(imageBuffer);
    } catch (error: any) {
      console.error(`[TileProxy] Error descargando tile ${tileCoord.cacheKey}:`, error?.message);
      res.redirect(googleUrl);
    }
  };
}
