import { InvalidUploadException } from '../exceptions/invalid-upload.exception';

/**
 * Value Object que valida coordenadas de teselas (Slippy Map Tiles z/x/y)
 * y previene ataques de Path Traversal (../) e inyección de parámetros SSRF.
 */
export class TileCoordinateVO {
  public readonly z: number;
  public readonly x: number;
  public readonly yNumber: number;
  public readonly fileName: string;

  private static readonly NUMERIC_SEGMENT = /^\d+$/;
  private static readonly Y_SEGMENT = /^(\d+)(?:\.(jpg|png))?$/i;

  constructor(rawZ: string, rawX: string, rawY: string) {
    if (!TileCoordinateVO.NUMERIC_SEGMENT.test(rawZ || '') || !TileCoordinateVO.NUMERIC_SEGMENT.test(rawX || '')) {
      throw new InvalidUploadException('Coordenadas de tesela (z/x) inválidas o intento de Path Traversal detectado.');
    }

    const yMatch = TileCoordinateVO.Y_SEGMENT.exec(rawY || '');
    if (!yMatch) {
      throw new InvalidUploadException('Segmento de tesela (y) inválido.');
    }

    const zVal = Number(rawZ);
    const xVal = Number(rawX);
    const yVal = Number(yMatch[1]);

    if (zVal < 0 || zVal > 22) {
      throw new InvalidUploadException(`Nivel de zoom z=${zVal} fuera del rango permitido (0..22).`);
    }

    const maxTileIndex = Math.pow(2, zVal);
    if (xVal < 0 || xVal >= maxTileIndex || yVal < 0 || yVal >= maxTileIndex) {
      throw new InvalidUploadException(`Índices de tesela (${xVal}, ${yVal}) fuera del límite para zoom ${zVal}.`);
    }

    this.z = zVal;
    this.x = xVal;
    this.yNumber = yVal;
    this.fileName = `${yVal}.jpg`;
  }

  public getUpstreamSatelliteUrl(): string {
    return `http://mt0.google.com/vt/lyrs=s&hl=es&x=${this.x}&y=${this.yNumber}&z=${this.z}`;
  }
}
