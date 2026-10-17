import { PosterEntity } from '../../../domain/entities/poster.entity';

export interface SavePosterData {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  type?: string;
}

export interface PosterRepositoryPort {
  findAll(): Promise<PosterEntity[]>;
  create(data: SavePosterData): Promise<PosterEntity>;
  update(id: number, data: SavePosterData): Promise<PosterEntity | null>;
  delete(id: number): Promise<PosterEntity | null>;
}
