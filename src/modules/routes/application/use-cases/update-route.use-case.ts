import { RouteDto, RouteRepositoryPort } from '../ports/repositories/route-repository.port';
import { RouteColorVO } from '../../domain/value-objects/route-color.vo';
import { RouteNotFoundException } from '../../domain/exceptions/route-not-found.exception';
import { RouteEntity } from '../../domain/entities/route.entity';

export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute(id: number, dto: RouteDto) {
    const colorVo = new RouteColorVO(dto.color);
    const resolvedGeojson = dto.geojson ?? dto.coordinates;

    let finalDifficulty = dto.difficulty ?? null;
    let finalColor = colorVo.value;
    let finalDuration =
      dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null;

    if (resolvedGeojson && typeof resolvedGeojson === 'object') {
      const draftEntity = new RouteEntity({
        id,
        name: dto.name,
        description: dto.description ?? null,
        duration: finalDuration,
        difficulty: finalDifficulty,
        color: finalColor,
        coordinates: resolvedGeojson,
      });
      finalDifficulty = draftEntity.difficulty;
      finalColor = draftEntity.color;
      if (!finalDuration) {
        finalDuration = String(draftEntity.getEstimatedDurationMinutes());
      }
    }

    const updated = await this.routeRepository.update(id, {
      name: dto.name,
      description: dto.description ?? null,
      duration: finalDuration,
      difficulty: finalDifficulty,
      color: finalColor,
      geojson: resolvedGeojson !== undefined ? resolvedGeojson : undefined,
    });
    if (!updated) {
      throw new RouteNotFoundException('Route not found');
    }
    return updated.toRawRecord();
  }
}


