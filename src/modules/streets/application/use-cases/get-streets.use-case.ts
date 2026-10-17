import { StreetRepositoryPort } from '../ports/repositories/street-repository.port';

export class GetStreetsUseCase {
  constructor(private readonly streetRepository: StreetRepositoryPort) {}

  async execute(): Promise<unknown[]> {
    const streets = await this.streetRepository.findAll();
    return streets.map((s) => s.geojson);
  }
}
