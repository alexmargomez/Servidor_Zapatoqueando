import { PlaceRepositoryPort } from '../ports/repositories/place-repository.port';

export class GetPlacesUseCase {
  constructor(private readonly placeRepository: PlaceRepositoryPort) {}

  async execute() {
    const places = await this.placeRepository.findAll();
    return places.map((place) => place.toPublicResponse());
  }
}
