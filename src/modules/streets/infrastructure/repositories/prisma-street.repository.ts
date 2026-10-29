import { Prisma } from '@prisma/client';
import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import { StreetRepositoryPort } from '../../application/ports/repositories/street-repository.port';
import { StreetEntity } from '../../domain/entities/street.entity';

export class PrismaStreetRepository implements StreetRepositoryPort {
  async findAll(limit = 1000): Promise<StreetEntity[]> {
    const safeTake = Math.min(Math.max(1, limit), 2000);
    const rows = await prisma.street.findMany({
      take: safeTake,
      orderBy: { id: 'asc' },
    });
    return rows.map(
      (r) =>
        new StreetEntity({
          id: r.id,
          name: r.name,
          geojson: r.geojson,
        })
    );
  }

  async count(): Promise<number> {
    return prisma.street.count();
  }

  async createMany(items: Array<{ name: string; geojson: unknown }>): Promise<number> {
    const res = await prisma.street.createMany({
      data: items.map((item) => ({
        name: item.name,
        geojson: item.geojson as Prisma.InputJsonValue,
      })),
    });
    return res.count;
  }
}
