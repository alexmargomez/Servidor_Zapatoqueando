import { GetPostersUseCase } from '../../../src/modules/posters/application/use-cases/get-posters.use-case';
import { CreatePosterUseCase } from '../../../src/modules/posters/application/use-cases/create-poster.use-case';
import { UpdatePosterUseCase } from '../../../src/modules/posters/application/use-cases/update-poster.use-case';
import { DeletePosterUseCase } from '../../../src/modules/posters/application/use-cases/delete-poster.use-case';
import { PosterRepositoryPort } from '../../../src/modules/posters/application/ports/repositories/poster-repository.port';
import { PosterEntity } from '../../../src/modules/posters/domain/entities/poster.entity';
import { PosterNotFoundException } from '../../../src/modules/posters/domain/exceptions/poster-not-found.exception';

describe('Posters Use Cases', () => {
  let posterRepository: jest.Mocked<PosterRepositoryPort>;

  const samplePoster = new PosterEntity({
    id: 1,
    title: 'Café Zapatoca',
    description: 'El mejor café de origen',
    imageUrl: '/uploads/cafe.jpg',
    type: 'business',
    orderIndex: 0,
  });

  beforeEach(() => {
    posterRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  });

  describe('GetPostersUseCase', () => {
    it('should return all posters mapped via toResponse()', async () => {
      posterRepository.findAll.mockResolvedValue([samplePoster]);
      const useCase = new GetPostersUseCase(posterRepository);

      const result = await useCase.execute();

      expect(posterRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([samplePoster.toResponse()]);
    });
  });

  describe('CreatePosterUseCase', () => {
    it('should normalize poster type and support imageUrl / image_url aliases', async () => {
      posterRepository.create.mockResolvedValue(samplePoster);
      const useCase = new CreatePosterUseCase(posterRepository);

      const result = await useCase.execute({
        title: 'Café Zapatoca',
        description: 'El mejor café de origen',
        image_url: '/uploads/cafe.jpg',
        type: 'BUSINESS',
      });

      expect(posterRepository.create).toHaveBeenCalledWith({
        title: 'Café Zapatoca',
        description: 'El mejor café de origen',
        imageUrl: '/uploads/cafe.jpg',
        type: 'business',
      });
      expect(result).toEqual(samplePoster.toResponse());
    });
  });

  describe('UpdatePosterUseCase', () => {
    it('should update an existing poster and return its response', async () => {
      posterRepository.update.mockResolvedValue(samplePoster);
      const useCase = new UpdatePosterUseCase(posterRepository);

      const result = await useCase.execute(1, {
        title: 'Café Zapatoca Editado',
        imageurl: '/uploads/cafe.jpg',
        type: 'business',
      });

      expect(posterRepository.update).toHaveBeenCalledWith(1, {
        title: 'Café Zapatoca Editado',
        description: null,
        imageUrl: '/uploads/cafe.jpg',
        type: 'business',
      });
      expect(result).toEqual(samplePoster.toResponse());
    });

    it('should throw PosterNotFoundException when poster does not exist', async () => {
      posterRepository.update.mockResolvedValue(null);
      const useCase = new UpdatePosterUseCase(posterRepository);

      await expect(useCase.execute(999, { title: 'No existe' })).rejects.toThrow(
        PosterNotFoundException
      );
    });
  });

  describe('DeletePosterUseCase', () => {
    it('should delete an existing poster and return its response', async () => {
      posterRepository.delete.mockResolvedValue(samplePoster);
      const useCase = new DeletePosterUseCase(posterRepository);

      const result = await useCase.execute(1);

      expect(posterRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(samplePoster.toResponse());
    });

    it('should throw PosterNotFoundException when deleting a non-existent poster', async () => {
      posterRepository.delete.mockResolvedValue(null);
      const useCase = new DeletePosterUseCase(posterRepository);

      await expect(useCase.execute(999)).rejects.toThrow(PosterNotFoundException);
    });
  });
});
