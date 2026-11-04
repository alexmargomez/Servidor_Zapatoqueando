import crypto from 'crypto';
import { PlaceDto, PlaceRepositoryPort } from '../ports/repositories/place-repository.port';
import { CoordinatesVO } from '../../domain/value-objects/coordinates.vo';

const parseBool = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
  return false;
};

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
      is_partner: parseBool(dto.is_partner),
      whatsapp: dto.whatsapp?.trim() || null,
      offer_title: dto.offer_title?.trim() || null,
      offer_code: dto.offer_code?.trim().toUpperCase() || null,
      specialty: dto.specialty?.trim() || null,
      schedule: dto.schedule?.trim() || null,
      price_range: dto.price_range?.trim() || null,
    });
    return created.toRawRecord();
  }
}
