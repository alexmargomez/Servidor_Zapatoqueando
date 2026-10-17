import { PlaceRepositoryPort } from '../ports/repositories/place-repository.port';
import { PlaceNotFoundException } from '../../domain/exceptions/place-not-found.exception';

export class DeletePlaceUseCase {
  constructor(private readonly placeRepository: PlaceRepositoryPort) {}

  async execute(id: number) {
    const deleted = await this.placeRepository.delete(id);
    if (!deleted) {
      throw new PlaceNotFoundException('Place not found');
    }
    return deleted.toRawRecord();
  }
}
