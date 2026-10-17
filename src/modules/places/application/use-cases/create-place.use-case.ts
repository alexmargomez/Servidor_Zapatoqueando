import crypto from 'crypto';
import { PlaceRepositoryPort } from '../ports/repositories/place-repository.port';
import { CoordinatesVO } from '../../domain/value-objects/coordinates.vo';
import { PlaceDto } from '../../infrastructure/dtos/place.dto';

export class CreatePlaceUseCase {
  constructor(private readonly placeRepository: PlaceRepositoryPort) {}

  async execute(dto: PlaceDto) {
    const coords = new CoordinatesVO(dto.lat, dto.lng);
    const created = await this.placeRepository.create({
      place_id: dto.place_id || crypto.randomUUID(),
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
    return created.toRawRecord();
  }
}
