import { RouteDto, RouteRepositoryPort } from '../ports/repositories/route-repository.port';
import { RouteColorVO } from '../../domain/value-objects/route-color.vo';
import { RouteNotFoundException } from '../../domain/exceptions/route-not-found.exception';

export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute(id: number, dto: RouteDto) {
    const colorVo = new RouteColorVO(dto.color);
    const resolvedGeojson = dto.geojson ?? dto.coordinates;
    const updated = await this.routeRepository.update(id, {
      name: dto.name,
      description: dto.description ?? null,
      duration: dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null,
      difficulty: dto.difficulty ?? null,
      color: colorVo.value,
      geojson: resolvedGeojson !== undefined ? resolvedGeojson : undefined,
    });
    if (!updated) {
      throw new RouteNotFoundException('Route not found');
    }
    return updated.toRawRecord();
  }
}

