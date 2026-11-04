import crypto from 'crypto';
import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CreatePlaceData,
  PlaceMetricType,
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
    is_partner?: boolean | null;
    whatsapp?: string | null;
    offer_title?: string | null;
    offer_code?: string | null;
    specialty?: string | null;
    schedule?: string | null;
    price_range?: string | null;
    views_count?: number | null;
    whatsapp_clicks?: number | null;
    checkins_count?: number | null;
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
      isPartner: row.is_partner ?? false,
      whatsapp: row.whatsapp ?? null,
      offerTitle: row.offer_title ?? null,
      offerCode: row.offer_code ?? null,
      specialty: row.specialty ?? null,
      schedule: row.schedule ?? null,
      priceRange: row.price_range ?? null,
      viewsCount: row.views_count ?? 0,
      whatsappClicks: row.whatsapp_clicks ?? 0,
      checkinsCount: row.checkins_count ?? 0,
    });
  }

  async findAll(limit: number = 500): Promise<PlaceEntity[]> {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const rows = await prisma.place.findMany({
      orderBy: [{ is_partner: 'desc' }, { id: 'asc' }],
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
        is_partner: Boolean(data.is_partner),
        whatsapp: data.whatsapp ?? null,
        offer_title: data.offer_title ?? null,
        offer_code: data.offer_code ?? null,
        specialty: data.specialty ?? null,
        schedule: data.schedule ?? null,
        price_range: data.price_range ?? null,
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
        is_partner: data.is_partner !== undefined ? Boolean(data.is_partner) : existing.is_partner,
        whatsapp: data.whatsapp !== undefined ? data.whatsapp : existing.whatsapp,
        offer_title: data.offer_title !== undefined ? data.offer_title : existing.offer_title,
        offer_code: data.offer_code !== undefined ? data.offer_code : existing.offer_code,
        specialty: data.specialty !== undefined ? data.specialty : existing.specialty,
        schedule: data.schedule !== undefined ? data.schedule : existing.schedule,
        price_range: data.price_range !== undefined ? data.price_range : existing.price_range,
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

  async trackMetric(id: number, metric: PlaceMetricType): Promise<PlaceEntity | null> {
    const existing = await prisma.place.findUnique({ where: { id } });
    if (!existing) return null;

    const updateField =
      metric === 'whatsapp'
        ? { whatsapp_clicks: { increment: 1 } }
        : metric === 'checkin'
          ? { checkins_count: { increment: 1 } }
          : { views_count: { increment: 1 } };

    const row = await prisma.place.update({
      where: { id },
      data: updateField,
    });
    return this.mapRowToEntity(row);
  }
}
