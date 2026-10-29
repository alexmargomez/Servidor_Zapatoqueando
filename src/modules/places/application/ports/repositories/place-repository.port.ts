import { PlaceEntity } from '../../../domain/entities/place.entity';

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
}

export interface PlaceRepositoryPort {
  findAll(limit?: number): Promise<PlaceEntity[]>;
  create(data: CreatePlaceData): Promise<PlaceEntity>;
  update(id: number, data: CreatePlaceData): Promise<PlaceEntity | null>;
  delete(id: number): Promise<PlaceEntity | null>;
}
