import { PlaceDto, PlaceRepositoryPort } from '../ports/repositories/place-repository.port';
import { CoordinatesVO } from '../../domain/value-objects/coordinates.vo';
import { PlaceNotFoundException } from '../../domain/exceptions/place-not-found.exception';

const parseOptionalBool = (val: unknown): boolean | undefined => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
  return undefined;
};

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
      image_url: dto.image_url !== undefined ? dto.image_url : undefined,
      lat: coords.lat,
      lng: coords.lng,
      category: dto.category || 'Lugares turísticos',
      description: dto.description ?? null,
      is_partner: parseOptionalBool(dto.is_partner),
      whatsapp: dto.whatsapp !== undefined ? (dto.whatsapp?.trim() || null) : undefined,
      offer_title: dto.offer_title !== undefined ? (dto.offer_title?.trim() || null) : undefined,
      offer_code: dto.offer_code !== undefined ? (dto.offer_code?.trim().toUpperCase() || null) : undefined,
      specialty: dto.specialty !== undefined ? (dto.specialty?.trim() || null) : undefined,
      schedule: dto.schedule !== undefined ? (dto.schedule?.trim() || null) : undefined,
      price_range: dto.price_range !== undefined ? (dto.price_range?.trim() || null) : undefined,
    });

    if (!updated) {
      throw new PlaceNotFoundException('Place not found');
    }

    return updated.toRawRecord();
  }
}

