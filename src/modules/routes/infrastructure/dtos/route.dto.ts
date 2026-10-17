export interface RouteDto {
  name: string;
  description?: string | null;
  duration?: string | number | null;
  difficulty?: string | null;
  color?: string | null;
  geojson?: unknown;
  coordinates?: unknown;
}
