import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { TileCoordinateVO } from '../../domain/value-objects/tile-coordinate.vo';

const CACHE_DIR = path.resolve(process.cwd(), 'public/map-cache');
const MAX_TILE_BYTES = 2 * 1024 * 1024; // 2 MB límite duro anti-OOM por tesela

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export class TileCacheService {
  /**
   * Mapa SingleFlight de descargas en curso para coalescer peticiones concurrentes
   * hacia una misma coordenada {z}/{x}/{y} fría.
   */
  private static readonly inFlightDownloads = new Map<string, Promise<Buffer>>();

  resolveLocalPaths(tileCoord: TileCoordinateVO): { tileDir: string; filePath: string } {
    const tileDir = path.join(CACHE_DIR, String(tileCoord.z), String(tileCoord.x));
    const filePath = path.join(tileDir, tileCoord.fileName);
    return { tileDir, filePath };
  }

  async hasCachedTile(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  async getOrFetchTileBuffer(tileCoord: TileCoordinateVO): Promise<Buffer> {
    const { tileDir, filePath } = this.resolveLocalPaths(tileCoord);
    const upstreamUrl = tileCoord.getUpstreamSatelliteUrl();

    let downloadPromise = TileCacheService.inFlightDownloads.get(tileCoord.cacheKey);
    if (!downloadPromise) {
      downloadPromise = this.fetchAndPersistTileAtomically(upstreamUrl, tileDir, filePath).finally(
        () => {
          TileCacheService.inFlightDownloads.delete(tileCoord.cacheKey);
        }
      );
      TileCacheService.inFlightDownloads.set(tileCoord.cacheKey, downloadPromise);
    }

    return downloadPromise;
  }

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
      maxContentLength: MAX_TILE_BYTES,
      maxBodyLength: MAX_TILE_BYTES,
    });

    const buffer = Buffer.from(response.data);
    if (buffer.length > MAX_TILE_BYTES) {
      throw new Error('Tile payload exceeds maximum allowed size (2MB).');
    }
    if (!TileCoordinateVO.isValidImageMagicBytes(buffer)) {
      throw new Error('Upstream response did not contain valid JPEG/PNG magic bytes.');
    }

    await fs.promises.mkdir(tileDir, { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      await fs.promises.writeFile(tmpPath, buffer);
      await fs.promises.rename(tmpPath, filePath);
    } catch (err) {
      await fs.promises.unlink(tmpPath).catch(() => {});
      throw err;
    }
    return buffer;
  }
}
