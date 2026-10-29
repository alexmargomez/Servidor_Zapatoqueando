import crypto from 'crypto';
import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CreatePlaceData,
  PlaceRepositoryPort,
} from '../../application/ports/repositories/place-repository.port';
import { PlaceEntity } from '../../domain/entities/place.entity';

export class PrismaPlaceRepository implements PlaceRepositoryPort {
  private mapRowToEntity(row: {
    id: number;
    place_id: string;
    name: string;
    rating: number | null;
    user_ratings_total: number | null;
    formatted_address: string | null;
    image_url: string | null;
    lat: number | null;
    lng: number | null;
    category: string | null;
    description: string | null;
  }): PlaceEntity {
    return new PlaceEntity({
      id: row.id,
      placeId: row.place_id,
      name: row.name,
      rating: row.rating,
      userRatingsTotal: row.user_ratings_total,
      formattedAddress: row.formatted_address,
      imageUrl: row.image_url,
      lat: row.lat,
      lng: row.lng,
      category: row.category || 'Lugares turísticos',
      description: row.description,
    });
  }

  async findAll(limit: number = 500): Promise<PlaceEntity[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await prisma.place.findMany({
      orderBy: { id: 'asc' },
      take: safeLimit,
    });
    return rows.map((r) => this.mapRowToEntity(r));
  }

  async create(data: CreatePlaceData): Promise<PlaceEntity> {
    const row = await prisma.place.create({
      data: {
        place_id: data.place_id || crypto.randomUUID(),
        name: data.name,
        rating: data.rating ?? null,
        user_ratings_total: data.user_ratings_total ?? null,
        formatted_address: data.formatted_address ?? null,
        image_url: data.image_url ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        category: data.category || 'Lugares turísticos',
        description: data.description ?? null,
      },
    });
    return this.mapRowToEntity(row);
  }

  async update(id: number, data: CreatePlaceData): Promise<PlaceEntity | null> {
    const existing = await prisma.place.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.place.update({
      where: { id },
      data: {
        name: data.name,
        rating: data.rating ?? null,
        user_ratings_total: data.user_ratings_total ?? null,
        formatted_address: data.formatted_address ?? null,
        image_url: data.image_url !== undefined ? data.image_url : existing.image_url,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        category: data.category || 'Lugares turísticos',
        description: data.description ?? null,
      },
    });
    return this.mapRowToEntity(row);
  }

  async delete(id: number): Promise<PlaceEntity | null> {
    const existing = await prisma.place.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.place.delete({ where: { id } });
    return this.mapRowToEntity(row);
  }
}
