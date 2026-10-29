import { TileCoordinateVO } from '../../../src/modules/uploads/domain/value-objects/tile-coordinate.vo';
import { CoordinatesVO } from '../../../src/modules/places/domain/value-objects/coordinates.vo';
import { SAFE_IMAGE_MIME_EXTENSIONS } from '../../../src/shared/infrastructure/http/middlewares/upload.middleware';

describe('TileCoordinateVO & Geospatial Security', () => {
  it('should accept valid Slippy Map tile coordinates, use HTTPS, and normalize filename', () => {
    const coord = new TileCoordinateVO('15', '9714', '15820.jpg');
    expect(coord.z).toBe(15);
    expect(coord.x).toBe(9714);
    expect(coord.yNumber).toBe(15820);
    expect(coord.fileName).toBe('15820.jpg');
    expect(coord.getUpstreamSatelliteUrl()).toBe(
      'https://mt0.google.com/vt/lyrs=s&hl=es&x=9714&y=15820&z=15'
    );
  });

  it('should verify JPEG and PNG magic bytes and reject HTML/CAPTCHA cache poisoning payloads', () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const htmlPayload = Buffer.from('<!DOCTYPE html><html><body>429 Too Many Requests</body></html>');

    expect(TileCoordinateVO.isValidImageMagicBytes(jpegHeader)).toBe(true);
    expect(TileCoordinateVO.isValidImageMagicBytes(pngHeader)).toBe(true);
    expect(TileCoordinateVO.isValidImageMagicBytes(htmlPayload)).toBe(false);
    expect(SAFE_IMAGE_MIME_EXTENSIONS['image/svg+xml']).toBeUndefined();
  });

  it('should block Path Traversal payloads (../) and out-of-range zoom levels', () => {
    expect(() => new TileCoordinateVO('..', '10', '20.jpg')).toThrow();
    expect(() => new TileCoordinateVO('15', '../etc', 'passwd')).toThrow();
    expect(() => new TileCoordinateVO('25', '1', '1.jpg')).toThrow();
    expect(() => new TileCoordinateVO('2', '99', '1.jpg')).toThrow();
  });

  it('should validate Zapatoca municipal boundary and compute Haversine distance', () => {
    const parqueZapatoca = new CoordinatesVO(6.8152, -73.2684);
    const cuevaDelNitro = new CoordinatesVO(6.8210, -73.2650);
    const bogota = new CoordinatesVO(4.7110, -74.0721);

    expect(parqueZapatoca.isWithinZapatocaBoundary()).toBe(true);
    expect(bogota.isWithinZapatocaBoundary()).toBe(false);

    const distance = parqueZapatoca.distanceToMeters(cuevaDelNitro);
    expect(distance).not.toBeNull();
    expect(distance!).toBeGreaterThan(500);
    expect(distance!).toBeLessThan(1000);
  });
});
