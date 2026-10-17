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
}
