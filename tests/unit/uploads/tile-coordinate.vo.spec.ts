import { TileCoordinateVO } from '../../../src/modules/uploads/domain/value-objects/tile-coordinate.vo';
import { CoordinatesVO } from '../../../src/modules/places/domain/value-objects/coordinates.vo';

describe('TileCoordinateVO & Geospatial Security', () => {
  it('should accept valid Slippy Map tile coordinates and normalize filename', () => {
    const coord = new TileCoordinateVO('15', '9714', '15820.jpg');
    expect(coord.z).toBe(15);
    expect(coord.x).toBe(9714);
    expect(coord.yNumber).toBe(15820);
    expect(coord.fileName).toBe('15820.jpg');
    expect(coord.getUpstreamSatelliteUrl()).toContain('x=9714&y=15820&z=15');
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
