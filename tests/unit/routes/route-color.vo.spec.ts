import { RouteColorVO } from '../../../src/modules/routes/domain/value-objects/route-color.vo';
import { RouteEntity } from '../../../src/modules/routes/domain/entities/route.entity';

describe('RouteColorVO & RouteEntity', () => {
  describe('RouteColorVO', () => {
    it('should accept valid 6-digit hex colors', () => {
      expect(new RouteColorVO('#ff5500').value).toBe('#ff5500');
      expect(new RouteColorVO(' #10B981 ').value).toBe('#10B981');
    });

    it('should fallback to #eab308 for invalid or empty hex strings', () => {
      expect(new RouteColorVO('').value).toBe('#eab308');
      expect(new RouteColorVO('red').value).toBe('#eab308');
      expect(new RouteColorVO('#123').value).toBe('#eab308');
    });
  });

  describe('RouteEntity', () => {
    it('should format route as a valid GeoJSON Feature via toGeoJsonFeature()', () => {
      const geometry = {
        type: 'LineString',
        coordinates: [
          [-73.268, 6.815],
          [-73.265, 6.818],
        ],
      };

      const entity = new RouteEntity({
        id: 7,
        name: 'Camino de Lengerke',
        description: 'Ruta histórica empedrada',
        duration: '3h',
        difficulty: 'Media',
        color: '#10b981',
        coordinates: geometry,
      });

      expect(entity.toGeoJsonFeature()).toEqual({
        type: 'Feature',
        geometry,
        properties: {
          id: 7,
          route_id: 7,
          name: 'Camino de Lengerke',
          description: 'Ruta histórica empedrada',
          duration: '3h',
          difficulty: 'Media',
          color: '#10b981',
        },
      });
    });
  });
});
