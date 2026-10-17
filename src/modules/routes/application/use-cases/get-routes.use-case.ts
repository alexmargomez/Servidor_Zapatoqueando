import { RouteRepositoryPort } from '../ports/repositories/route-repository.port';

export class GetRoutesUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute() {
    const routes = await this.routeRepository.findAll();
    return routes.map((r) => r.toGeoJsonFeature());
  }
}
