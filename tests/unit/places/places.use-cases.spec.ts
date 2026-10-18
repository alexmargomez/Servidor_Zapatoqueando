import { GetPlacesUseCase } from '../../../src/modules/places/application/use-cases/get-places.use-case';
import { CreatePlaceUseCase } from '../../../src/modules/places/application/use-cases/create-place.use-case';
import { UpdatePlaceUseCase } from '../../../src/modules/places/application/use-cases/update-place.use-case';
import { DeletePlaceUseCase } from '../../../src/modules/places/application/use-cases/delete-place.use-case';
import { PlaceRepositoryPort } from '../../../src/modules/places/application/ports/repositories/place-repository.port';
import { PlaceEntity } from '../../../src/modules/places/domain/entities/place.entity';
import { PlaceNotFoundException } from '../../../src/modules/places/domain/exceptions/place-not-found.exception';

describe('Places Use Cases', () => {
  let placeRepository: jest.Mocked<PlaceRepositoryPort>;

  const sampleEntity = new PlaceEntity({
    id: 1,
    placeId: 'place-uuid-1',
    name: 'Mirador Guane',
    rating: 4.7,
    userRatingsTotal: 80,
    formattedAddress: 'Vía al Mirador',
    imageUrl: '/uploads/mirador.jpg',
    lat: 6.82,
    lng: -73.26,
    category: 'Lugares turísticos',
    description: 'Vista panorámica del Cañón del Suárez',
  });

  beforeEach(() => {
    placeRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  describe('GetPlacesUseCase', () => {
    it('should return all places mapped to public response format', async () => {
      placeRepository.findAll.mockResolvedValue([sampleEntity]);
      const useCase = new GetPlacesUseCase(placeRepository);

      const result = await useCase.execute();

      expect(placeRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sampleEntity.toPublicResponse());
    });
  });

  describe('CreatePlaceUseCase', () => {
    it('should create a place with parsed coordinates and default category when omitted', async () => {
      placeRepository.create.mockResolvedValue(sampleEntity);
      const useCase = new CreatePlaceUseCase(placeRepository);

      const result = await useCase.execute({
        name: 'Mirador Guane',
        lat: '6.82',
        lng: '-73.26',
        rating: '4.7',
      });

      expect(placeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mirador Guane',
          lat: 6.82,
          lng: -73.26,
          rating: 4.7,
          category: 'Lugares turísticos',
        })
      );
      expect(result).toEqual(sampleEntity.toRawRecord());
    });
  });

  describe('UpdatePlaceUseCase', () => {
    it('should update an existing place and return raw record', async () => {
      placeRepository.update.mockResolvedValue(sampleEntity);
      const useCase = new UpdatePlaceUseCase(placeRepository);

      const result = await useCase.execute(1, {
        name: 'Mirador Guane Actualizado',
        lat: 6.82,
        lng: -73.26,
        category: 'Lugares turísticos',
      });

      expect(placeRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Mirador Guane Actualizado',
          lat: 6.82,
          lng: -73.26,
        })
      );
      expect(result).toEqual(sampleEntity.toRawRecord());
    });

    it('should throw PlaceNotFoundException when updating a non-existent place', async () => {
      placeRepository.update.mockResolvedValue(null);
      const useCase = new UpdatePlaceUseCase(placeRepository);

      await expect(useCase.execute(999, { name: 'Inexistente' })).rejects.toThrow(
        PlaceNotFoundException
      );
    });
  });

  describe('DeletePlaceUseCase', () => {
    it('should delete an existing place and return its raw record', async () => {
      placeRepository.delete.mockResolvedValue(sampleEntity);
      const useCase = new DeletePlaceUseCase(placeRepository);

      const result = await useCase.execute(1);

      expect(placeRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleEntity.toRawRecord());
    });

    it('should throw PlaceNotFoundException when deleting a non-existent place', async () => {
      placeRepository.delete.mockResolvedValue(null);
      const useCase = new DeletePlaceUseCase(placeRepository);

      await expect(useCase.execute(999)).rejects.toThrow(PlaceNotFoundException);
    });
  });
});
