import { RouteDto, RouteRepositoryPort } from '../ports/repositories/route-repository.port';
import { RouteColorVO } from '../../domain/value-objects/route-color.vo';
import { RouteEntity } from '../../domain/entities/route.entity';

export class CreateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute(dto: RouteDto) {
    const rawGeojson = dto.geojson || dto.coordinates || { type: 'LineString', coordinates: [] };
    const colorVo = new RouteColorVO(dto.color);
    const draftEntity = new RouteEntity({
      id: 0,
      name: dto.name,
      description: dto.description ?? null,
      duration: dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null,
      difficulty: dto.difficulty ?? null,
      color: colorVo.value,
      coordinates: rawGeojson,
    });

    const created = await this.routeRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      duration:
        dto.duration !== undefined && dto.duration !== null
          ? String(dto.duration)
          : String(draftEntity.getEstimatedDurationMinutes()),
      difficulty: draftEntity.difficulty,
      color: draftEntity.color,
      geojson: rawGeojson,
    });
    return created.toRawRecord();
  }
}

