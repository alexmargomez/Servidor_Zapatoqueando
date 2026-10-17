import { StreetEntity } from '../../../domain/entities/street.entity';

export interface StreetRepositoryPort {
  findAll(): Promise<StreetEntity[]>;
  count(): Promise<number>;
  createMany(items: Array<{ name: string; geojson: unknown }>): Promise<number>;
}
