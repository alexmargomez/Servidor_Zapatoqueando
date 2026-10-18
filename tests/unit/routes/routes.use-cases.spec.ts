import { GetRoutesUseCase } from '../../../src/modules/routes/application/use-cases/get-routes.use-case';
import { CreateRouteUseCase } from '../../../src/modules/routes/application/use-cases/create-route.use-case';
import { UpdateRouteUseCase } from '../../../src/modules/routes/application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from '../../../src/modules/routes/application/use-cases/delete-route.use-case';
import { RouteRepositoryPort } from '../../../src/modules/routes/application/ports/repositories/route-repository.port';
import { RouteEntity } from '../../../src/modules/routes/domain/entities/route.entity';
import { RouteNotFoundException } from '../../../src/modules/routes/domain/exceptions/route-not-found.exception';

describe('Routes Use Cases', () => {
  let routeRepository: jest.Mocked<RouteRepositoryPort>;

  const sampleRoute = new RouteEntity({
    id: 1,
    name: 'Sendero El Pico de la Vieja',
    description: 'Caminata ecológica',
    duration: '2.5h',
    difficulty: 'Alta',
    color: '#eab308',
    coordinates: {
      type: 'LineString',
      coordinates: [[-73.268, 6.815]],
    },
  });

  beforeEach(() => {
    routeRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  describe('GetRoutesUseCase', () => {
    it('should return all routes formatted as GeoJSON Features', async () => {
      routeRepository.findAll.mockResolvedValue([sampleRoute]);
      const useCase = new GetRoutesUseCase(routeRepository);

      const result = await useCase.execute();

      expect(routeRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([sampleRoute.toGeoJsonFeature()]);
    });
  });

  describe('CreateRouteUseCase', () => {
    it('should validate color and create a route returning raw record', async () => {
      routeRepository.create.mockResolvedValue(sampleRoute);
      const useCase = new CreateRouteUseCase(routeRepository);

      const result = await useCase.execute({
        name: 'Sendero El Pico de la Vieja',
        duration: '2.5h',
        difficulty: 'Alta',
        color: 'invalid-color',
      });

      expect(routeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sendero El Pico de la Vieja',
          color: '#eab308',
          geojson: { type: 'LineString', coordinates: [] },
        })
      );
      expect(result).toEqual(sampleRoute.toRawRecord());
    });
  });

  describe('UpdateRouteUseCase', () => {
    it('should update an existing route and return raw record', async () => {
      routeRepository.update.mockResolvedValue(sampleRoute);
      const useCase = new UpdateRouteUseCase(routeRepository);

      const result = await useCase.execute(1, {
        name: 'Sendero Actualizado',
        color: '#22c55e',
      });

      expect(routeRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Sendero Actualizado',
          color: '#22c55e',
        })
      );
      expect(result).toEqual(sampleRoute.toRawRecord());
    });

    it('should throw RouteNotFoundException when route does not exist', async () => {
      routeRepository.update.mockResolvedValue(null);
      const useCase = new UpdateRouteUseCase(routeRepository);

      await expect(useCase.execute(404, { name: 'Inexistente' })).rejects.toThrow(
        RouteNotFoundException
      );
    });
  });

  describe('DeleteRouteUseCase', () => {
    it('should delete an existing route and return raw record', async () => {
      routeRepository.delete.mockResolvedValue(sampleRoute);
      const useCase = new DeleteRouteUseCase(routeRepository);

      const result = await useCase.execute(1);

      expect(routeRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleRoute.toRawRecord());
    });

    it('should throw RouteNotFoundException when deleting a non-existent route', async () => {
      routeRepository.delete.mockResolvedValue(null);
      const useCase = new DeleteRouteUseCase(routeRepository);

      await expect(useCase.execute(404)).rejects.toThrow(RouteNotFoundException);
    });
  });
});
