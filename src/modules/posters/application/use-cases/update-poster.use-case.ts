import { PosterRepositoryPort } from '../ports/repositories/poster-repository.port';
import { PosterTypeVO } from '../../domain/value-objects/poster-type.vo';
import { PosterNotFoundException } from '../../domain/exceptions/poster-not-found.exception';
import { PosterDto } from '../../infrastructure/dtos/poster.dto';

export class UpdatePosterUseCase {
  constructor(private readonly posterRepository: PosterRepositoryPort) {}

  async execute(id: number, dto: PosterDto) {
    const typeVo = new PosterTypeVO(dto.type);
    const updated = await this.posterRepository.update(id, {
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl || dto.imageurl || dto.image_url || null,
      type: typeVo.value,
    });
    if (!updated) {
      throw new PosterNotFoundException('Poster not found');
    }
    return updated.toResponse();
  }
}
