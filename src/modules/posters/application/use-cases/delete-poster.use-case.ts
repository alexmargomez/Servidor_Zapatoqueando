import { PosterRepositoryPort } from '../ports/repositories/poster-repository.port';
import { PosterNotFoundException } from '../../domain/exceptions/poster-not-found.exception';

export class DeletePosterUseCase {
  constructor(private readonly posterRepository: PosterRepositoryPort) {}

  async execute(id: number) {
    const deleted = await this.posterRepository.delete(id);
    if (!deleted) {
      throw new PosterNotFoundException('Poster not found');
    }
    return deleted.toResponse();
  }
}
