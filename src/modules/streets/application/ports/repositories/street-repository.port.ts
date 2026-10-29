import { StreetEntity } from '../../../domain/entities/street.entity';

export interface StreetRepositoryPort {
  findAll(limit?: number): Promise<StreetEntity[]>;
  count(): Promise<number>;
  createMany(items: Array<{ name: string; geojson: unknown }>): Promise<number>;
}
