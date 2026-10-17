import { RouteRepositoryPort } from '../ports/repositories/route-repository.port';
import { RouteColorVO } from '../../domain/value-objects/route-color.vo';
import { RouteDto } from '../../infrastructure/dtos/route.dto';

export class CreateRouteUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute(dto: RouteDto) {
    const colorVo = new RouteColorVO(dto.color);
    const created = await this.routeRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      duration: dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null,
      difficulty: dto.difficulty ?? null,
      color: colorVo.value,
      geojson: dto.geojson || dto.coordinates || { type: 'LineString', coordinates: [] },
    });
    return created.toRawRecord();
  }
}
