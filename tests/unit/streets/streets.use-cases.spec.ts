import { GetStreetsUseCase } from '../../../src/modules/streets/application/use-cases/get-streets.use-case';
import { StreetRepositoryPort } from '../../../src/modules/streets/application/ports/repositories/street-repository.port';
import { StreetEntity } from '../../../src/modules/streets/domain/entities/street.entity';

describe('GetStreetsUseCase', () => {
  it('should return array of geojson objects from street entities', async () => {
    const sampleGeojson = {
      type: 'Feature',
      properties: { name: 'Carrera 10' },
      geometry: { type: 'LineString', coordinates: [[-73.268, 6.815]] },
    };

    const streetRepository: jest.Mocked<StreetRepositoryPort> = {
      findAll: jest.fn().mockResolvedValue([
        new StreetEntity({
          id: 1,
          name: 'Carrera 10',
          geojson: sampleGeojson,
        }),
      ]),
      count: jest.fn(),
      createMany: jest.fn(),
    };

    const useCase = new GetStreetsUseCase(streetRepository);
    const result = await useCase.execute();

    expect(streetRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([sampleGeojson]);
  });
});
