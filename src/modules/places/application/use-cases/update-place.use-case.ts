import { PlaceRepositoryPort } from '../ports/repositories/place-repository.port';
import { CoordinatesVO } from '../../domain/value-objects/coordinates.vo';
import { PlaceNotFoundException } from '../../domain/exceptions/place-not-found.exception';
import { PlaceDto } from '../../infrastructure/dtos/place.dto';

export class UpdatePlaceUseCase {
  constructor(private readonly placeRepository: PlaceRepositoryPort) {}

  async execute(id: number, dto: PlaceDto) {
    const coords = new CoordinatesVO(dto.lat, dto.lng);
    const updated = await this.placeRepository.update(id, {
      name: dto.name,
      rating: dto.rating !== undefined && dto.rating !== null ? Number(dto.rating) : null,
      user_ratings_total:
        dto.user_ratings_total !== undefined && dto.user_ratings_total !== null
          ? Number(dto.user_ratings_total)
          : null,
      formatted_address: dto.formatted_address ?? null,
      image_url: dto.image_url ?? null,
      lat: coords.lat,
      lng: coords.lng,
      category: dto.category || 'Lugares turísticos',
      description: dto.description ?? null,
    });

    if (!updated) {
      throw new PlaceNotFoundException('Place not found');
    }

    return updated.toRawRecord();
  }
}
