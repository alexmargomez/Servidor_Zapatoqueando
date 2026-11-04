import { RouteColorVO } from '../../../src/modules/routes/domain/value-objects/route-color.vo';
import { RouteEntity } from '../../../src/modules/routes/domain/entities/route.entity';
import { UpdateRouteUseCase } from '../../../src/modules/routes/application/use-cases/update-route.use-case';

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

      const feature = entity.toGeoJsonFeature();
      expect(feature.type).toBe('Feature');
      expect(feature.geometry).toEqual(geometry);
      expect(feature.properties).toEqual({
        id: 7,
        route_id: 7,
        name: 'Camino de Lengerke',
        description: 'Ruta histórica empedrada',
        duration: '3h',
        distance_km: 0.47,
        distance_label: '470 m',
        difficulty: 'Media',
        color: '#10b981',
      });
    });

    it('should compute estimated duration according to difficulty speed', () => {
      const longGeometry = {
        type: 'LineString',
        coordinates: [
          [-73.268, 6.815],
          [-73.24, 6.84],
        ],
      };
      const easyRoute = new RouteEntity({
        id: 1,
        name: 'Ruta Fácil',
        description: null,
        duration: null,
        difficulty: 'Fácil',
        color: '#eab308',
        coordinates: longGeometry,
      });
      const expertRoute = new RouteEntity({
        id: 2,
        name: 'Ruta Experto',
        description: null,
        duration: null,
        difficulty: 'Experto',
        color: '#dc2626',
        coordinates: longGeometry,
      });

      expect(expertRoute.getEstimatedDurationMinutes()).toBeGreaterThan(
        easyRoute.getEstimatedDurationMinutes()
      );
    });
  });

  describe('UpdateRouteUseCase', () => {
    it('should preserve undefined geojson when coordinates are omitted during partial update', async () => {
      const updateSpy = jest.fn().mockResolvedValue(
        new RouteEntity({
          id: 9,
          name: 'Sendero Actualizado',
          description: 'Con trazado intacto',
          duration: '45',
          difficulty: 'Media',
          color: '#f97316',
          coordinates: {
            type: 'LineString',
            coordinates: [
              [-73.268, 6.815],
              [-73.265, 6.818],
            ],
          },
        })
      );

      const useCase = new UpdateRouteUseCase({
        findAll: jest.fn(),
        create: jest.fn(),
        update: updateSpy,
        delete: jest.fn(),
      });

      await useCase.execute(9, {
        name: 'Sendero Actualizado',
        description: 'Con trazado intacto',
        duration: 45,
        difficulty: 'Media',
        color: '#f97316',
      });

      expect(updateSpy).toHaveBeenCalledWith(
        9,
        expect.objectContaining({
          name: 'Sendero Actualizado',
          geojson: undefined,
        })
      );
    });
  });
});

