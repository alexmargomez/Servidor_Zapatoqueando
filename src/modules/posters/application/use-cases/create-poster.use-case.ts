import { PosterRepositoryPort } from '../ports/repositories/poster-repository.port';
import { PosterTypeVO } from '../../domain/value-objects/poster-type.vo';
import { PosterDto } from '../../infrastructure/dtos/poster.dto';

export class CreatePosterUseCase {
  constructor(private readonly posterRepository: PosterRepositoryPort) {}

  async execute(dto: PosterDto) {
    const typeVo = new PosterTypeVO(dto.type);
    const created = await this.posterRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl || dto.imageurl || dto.image_url || null,
      type: typeVo.value,
    });
    return created.toResponse();
  }
}
