import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import {
  PosterRepositoryPort,
  SavePosterData,
} from '../../application/ports/repositories/poster-repository.port';
import { PosterEntity } from '../../domain/entities/poster.entity';

export class PrismaPosterRepository implements PosterRepositoryPort {
  private mapRowToEntity(row: {
    id: number;
    title: string;
    description: string | null;
    imageurl: string | null;
    image_url: string | null;
    type: string | null;
    order_index: number | null;
  }): PosterEntity {
    return new PosterEntity({
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.imageurl || row.image_url,
      type: row.type || 'event',
      orderIndex: row.order_index,
    });
  }

  async findAll(limit = 200): Promise<PosterEntity[]> {
    const safeTake = Math.min(Math.max(1, limit), 500);
    const rows = await prisma.poster.findMany({
      orderBy: { id: 'desc' },
      take: safeTake,
    });
    return rows.map((r) => this.mapRowToEntity(r));
  }

  async create(data: SavePosterData): Promise<PosterEntity> {
    const row = await prisma.poster.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        imageurl: data.imageUrl ?? null,
        image_url: data.imageUrl ?? null,
        type: data.type || 'event',
      },
    });
    return this.mapRowToEntity(row);
  }

  async update(id: number, data: SavePosterData): Promise<PosterEntity | null> {
    const existing = await prisma.poster.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.poster.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description ?? null,
        imageurl: data.imageUrl ?? null,
        image_url: data.imageUrl ?? null,
        type: data.type || 'event',
      },
    });
    return this.mapRowToEntity(row);
  }

  async delete(id: number): Promise<PosterEntity | null> {
    const existing = await prisma.poster.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.poster.delete({ where: { id } });
    return this.mapRowToEntity(row);
  }
}
