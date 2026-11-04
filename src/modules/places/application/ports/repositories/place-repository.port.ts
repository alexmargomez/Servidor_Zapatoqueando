import { PlaceEntity } from '../../../domain/entities/place.entity';

export type PlaceMetricType = 'view' | 'whatsapp' | 'checkin';

export interface PlaceDto {
  place_id?: string;
  name: string;
  rating?: number | string | null;
  user_ratings_total?: number | string | null;
  formatted_address?: string | null;
  image_url?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  category?: string;
  description?: string | null;
  is_partner?: boolean | string | null;
  whatsapp?: string | null;
  offer_title?: string | null;
  offer_code?: string | null;
  specialty?: string | null;
  schedule?: string | null;
  price_range?: string | null;
}

export interface CreatePlaceData {
  place_id?: string;
  name: string;
  rating?: number | null;
  user_ratings_total?: number | null;
  formatted_address?: string | null;
  image_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: string;
  description?: string | null;
  is_partner?: boolean | null;
  whatsapp?: string | null;
  offer_title?: string | null;
  offer_code?: string | null;
  specialty?: string | null;
  schedule?: string | null;
  price_range?: string | null;
}

export interface PlaceRepositoryPort {
  findAll(limit?: number): Promise<PlaceEntity[]>;
  create(data: CreatePlaceData): Promise<PlaceEntity>;
  update(id: number, data: CreatePlaceData): Promise<PlaceEntity | null>;
  delete(id: number): Promise<PlaceEntity | null>;
  trackMetric?(id: number, metric: PlaceMetricType): Promise<PlaceEntity | null>;
}

