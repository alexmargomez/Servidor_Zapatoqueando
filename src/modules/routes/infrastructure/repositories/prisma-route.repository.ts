import { Prisma } from '@prisma/client';
import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import {
  RouteRepositoryPort,
  SaveRouteData,
} from '../../application/ports/repositories/route-repository.port';
import { RouteEntity } from '../../domain/entities/route.entity';

export class PrismaRouteRepository implements RouteRepositoryPort {
  private mapRowToEntity(row: {
    id: number;
    name: string;
    description: string | null;
    duration: string | null;
    difficulty: string | null;
    color: string | null;
    coordinates: Prisma.JsonValue;
  }): RouteEntity {
    return new RouteEntity({
      id: row.id,
      name: row.name,
      description: row.description,
      duration: row.duration,
      difficulty: row.difficulty,
      color: row.color || '#eab308',
      coordinates: row.coordinates,
    });
  }

  async findAll(limit = 200): Promise<RouteEntity[]> {
    const safeTake = Math.min(Math.max(1, limit), 500);
    const rows = await prisma.route.findMany({
      orderBy: { id: 'desc' },
      take: safeTake,
    });
    return rows.map((r) => this.mapRowToEntity(r));
  }

  async create(data: SaveRouteData): Promise<RouteEntity> {
    const row = await prisma.route.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        duration: data.duration ?? null,
        difficulty: data.difficulty ?? null,
        color: data.color || '#eab308',
        coordinates: (data.geojson ?? { type: 'LineString', coordinates: [] }) as Prisma.InputJsonValue,
      },
    });
    return this.mapRowToEntity(row);
  }

  async update(id: number, data: SaveRouteData): Promise<RouteEntity | null> {
    const existing = await prisma.route.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.route.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
        duration: data.duration ?? null,
        difficulty: data.difficulty ?? null,
        color: data.color || '#eab308',
        coordinates: (data.geojson ?? existing.coordinates) as Prisma.InputJsonValue,
      },
    });
    return this.mapRowToEntity(row);
  }

  async delete(id: number): Promise<RouteEntity | null> {
    const existing = await prisma.route.findUnique({ where: { id } });
    if (!existing) return null;

    const row = await prisma.route.delete({ where: { id } });
    return this.mapRowToEntity(row);
  }
}
