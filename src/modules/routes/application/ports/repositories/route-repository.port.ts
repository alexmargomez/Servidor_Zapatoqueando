import { RouteEntity } from '../../../domain/entities/route.entity';

export interface SaveRouteData {
  name: string;
  description?: string | null;
  duration?: string | null;
  difficulty?: string | null;
  color?: string;
  geojson: unknown;
}

export interface RouteRepositoryPort {
  findAll(limit?: number): Promise<RouteEntity[]>;
  create(data: SaveRouteData): Promise<RouteEntity>;
  update(id: number, data: SaveRouteData): Promise<RouteEntity | null>;
  delete(id: number): Promise<RouteEntity | null>;
}
