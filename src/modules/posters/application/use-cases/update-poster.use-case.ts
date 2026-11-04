import { PosterDto, PosterRepositoryPort } from '../ports/repositories/poster-repository.port';
import { PosterTypeVO } from '../../domain/value-objects/poster-type.vo';
import { PosterNotFoundException } from '../../domain/exceptions/poster-not-found.exception';

export class UpdatePosterUseCase {
  constructor(private readonly posterRepository: PosterRepositoryPort) {}

  async execute(id: number, dto: PosterDto) {
    const typeVo = new PosterTypeVO(dto.type);
    const resolvedImage = dto.imageUrl ?? dto.imageurl ?? dto.image_url;
    const updated = await this.posterRepository.update(id, {
      title: dto.title,
      description: dto.description ?? null,
      imageUrl: resolvedImage !== undefined ? resolvedImage : undefined,
      type: typeVo.value,
    });
    if (!updated) {
      throw new PosterNotFoundException('Poster not found');
    }
    return updated.toResponse();
  }
}

