import { PosterRepositoryPort } from '../ports/repositories/poster-repository.port';

export class GetPostersUseCase {
  constructor(private readonly posterRepository: PosterRepositoryPort) {}

  async execute() {
    const posters = await this.posterRepository.findAll();
    return posters.map((p) => p.toResponse());
  }
}
