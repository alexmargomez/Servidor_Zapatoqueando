import { RouteRepositoryPort } from '../ports/repositories/route-repository.port';
import { RouteNotFoundException } from '../../domain/exceptions/route-not-found.exception';

export class DeleteRouteUseCase {
  constructor(private readonly routeRepository: RouteRepositoryPort) {}

  async execute(id: number) {
    const deleted = await this.routeRepository.delete(id);
    if (!deleted) {
      throw new RouteNotFoundException('Route not found');
    }
    return deleted.toRawRecord();
  }
}
