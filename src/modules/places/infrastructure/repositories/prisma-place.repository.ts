import crypto from 'crypto';
import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import {
  CreatePlaceData,
  PlaceMetricType,
  PlaceRepositoryPort,
} from '../../application/ports/repositories/place-repository.port';
import { PlaceEntity } from '../../domain/entities/place.entity';

interface PlaceRow {
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
}

export class PrismaPlaceRepository implements PlaceRepositoryPort {
  private mapRowToEntity(row: PlaceRow): PlaceEntity {
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
    try {
      const placeDelegate = prisma.place as unknown as {
        findMany: (args: unknown) => Promise<PlaceRow[]>;
      };
      const rows = await placeDelegate.findMany({
        orderBy: [{ is_partner: 'desc' }, { id: 'asc' }],
        take: safeLimit,
      });
      return rows.map((r) => this.mapRowToEntity(r));
    } catch {
      const rows = await prisma.$queryRawUnsafe<PlaceRow[]>(
        'SELECT * FROM places ORDER BY is_partner DESC NULLS LAST, id ASC LIMIT $1',
        safeLimit
      );
      return rows.map((r) => this.mapRowToEntity(r));
    }
  }

  async create(data: CreatePlaceData): Promise<PlaceEntity> {
    const payload = {
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
    };

    try {
      const placeDelegate = prisma.place as unknown as {
        create: (args: { data: typeof payload }) => Promise<PlaceRow>;
      };
      const row = await placeDelegate.create({ data: payload });
      return this.mapRowToEntity(row);
    } catch {
      const rows = await prisma.$queryRawUnsafe<PlaceRow[]>(
        `INSERT INTO places (
          place_id, name, rating, user_ratings_total, formatted_address, image_url,
          lat, lng, category, description, is_partner, whatsapp, offer_title, offer_code,
          specialty, schedule, price_range
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17
        ) RETURNING *`,
        payload.place_id,
        payload.name,
        payload.rating,
        payload.user_ratings_total,
        payload.formatted_address,
        payload.image_url,
        payload.lat,
        payload.lng,
        payload.category,
        payload.description,
        payload.is_partner,
        payload.whatsapp,
        payload.offer_title,
        payload.offer_code,
        payload.specialty,
        payload.schedule,
        payload.price_range
      );
      return this.mapRowToEntity(rows[0]);
    }
  }

  async update(id: number, data: CreatePlaceData): Promise<PlaceEntity | null> {
    const existing = (await prisma.place.findUnique({
      where: { id },
    })) as unknown as PlaceRow | null;
    if (!existing) return null;

    const payload = {
      name: data.name,
      rating: data.rating ?? null,
      user_ratings_total: data.user_ratings_total ?? null,
      formatted_address: data.formatted_address ?? null,
      image_url: data.image_url !== undefined ? data.image_url : existing.image_url,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      category: data.category || 'Lugares turísticos',
      description: data.description ?? null,
      is_partner:
        data.is_partner !== undefined ? Boolean(data.is_partner) : Boolean(existing.is_partner),
      whatsapp: data.whatsapp !== undefined ? data.whatsapp : (existing.whatsapp ?? null),
      offer_title:
        data.offer_title !== undefined ? data.offer_title : (existing.offer_title ?? null),
      offer_code: data.offer_code !== undefined ? data.offer_code : (existing.offer_code ?? null),
      specialty: data.specialty !== undefined ? data.specialty : (existing.specialty ?? null),
      schedule: data.schedule !== undefined ? data.schedule : (existing.schedule ?? null),
      price_range:
        data.price_range !== undefined ? data.price_range : (existing.price_range ?? null),
    };

    try {
      const placeDelegate = prisma.place as unknown as {
        update: (args: { where: { id: number }; data: typeof payload }) => Promise<PlaceRow>;
      };
      const row = await placeDelegate.update({
        where: { id },
        data: payload,
      });
      return this.mapRowToEntity(row);
    } catch {
      const rows = await prisma.$queryRawUnsafe<PlaceRow[]>(
        `UPDATE places SET
          name = $1, rating = $2, user_ratings_total = $3, formatted_address = $4,
          image_url = $5, lat = $6, lng = $7, category = $8, description = $9,
          is_partner = $10, whatsapp = $11, offer_title = $12, offer_code = $13,
          specialty = $14, schedule = $15, price_range = $16
        WHERE id = $17 RETURNING *`,
        payload.name,
        payload.rating,
        payload.user_ratings_total,
        payload.formatted_address,
        payload.image_url,
        payload.lat,
        payload.lng,
        payload.category,
        payload.description,
        payload.is_partner,
        payload.whatsapp,
        payload.offer_title,
        payload.offer_code,
        payload.specialty,
        payload.schedule,
        payload.price_range,
        id
      );
      return rows[0] ? this.mapRowToEntity(rows[0]) : null;
    }
  }

  async delete(id: number): Promise<PlaceEntity | null> {
    const existing = (await prisma.place.findUnique({
      where: { id },
    })) as unknown as PlaceRow | null;
    if (!existing) return null;

    const row = (await prisma.place.delete({ where: { id } })) as unknown as PlaceRow;
    return this.mapRowToEntity(row);
  }

  async trackMetric(id: number, metric: PlaceMetricType): Promise<PlaceEntity | null> {
    const existing = (await prisma.place.findUnique({
      where: { id },
    })) as unknown as PlaceRow | null;
    if (!existing) return null;

    const updateField =
      metric === 'whatsapp'
        ? { whatsapp_clicks: { increment: 1 } }
        : metric === 'checkin'
          ? { checkins_count: { increment: 1 } }
          : { views_count: { increment: 1 } };

    try {
      const placeDelegate = prisma.place as unknown as {
        update: (args: { where: { id: number }; data: unknown }) => Promise<PlaceRow>;
      };
      const row = await placeDelegate.update({
        where: { id },
        data: updateField,
      });
      return this.mapRowToEntity(row);
    } catch {
      const col =
        metric === 'whatsapp'
          ? 'whatsapp_clicks'
          : metric === 'checkin'
            ? 'checkins_count'
            : 'views_count';
      const rows = await prisma.$queryRawUnsafe<PlaceRow[]>(
        `UPDATE places SET ${col} = COALESCE(${col}, 0) + 1 WHERE id = $1 RETURNING *`,
        id
      );
      return rows[0] ? this.mapRowToEntity(rows[0]) : null;
    }
  }
}

