import { RouteRepositoryPort } from '../ports/repositories/route-repository.port';
import { RouteColorVO } from '../../domain/value-objects/route-color.vo';
import { RouteNotFoundException } from '../../domain/exceptions/route-not-found.exception';
import { RouteDto } from '../../infrastructure/dtos/route.dto';

export class UpdateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute(id: number, dto: RouteDto) {
    const colorVo = new RouteColorVO(dto.color);
    const updated = await this.routeRepository.update(id, {
      name: dto.name,
      description: dto.description ?? null,
      duration: dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null,
      difficulty: dto.difficulty ?? null,
      color: colorVo.value,
      geojson: dto.geojson || dto.coordinates || { type: 'LineString', coordinates: [] },
    });
    if (!updated) {
      throw new RouteNotFoundException('Route not found');
    }
    return updated.toRawRecord();
  }
}
