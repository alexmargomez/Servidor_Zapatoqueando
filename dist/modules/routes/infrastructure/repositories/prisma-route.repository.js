"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRouteRepository = void 0;
const prisma_service_1 = require("../../../../shared/infrastructure/database/prisma.service");
const route_entity_1 = require("../../domain/entities/route.entity");
class PrismaRouteRepository {
    mapRowToEntity(row) {
        return new route_entity_1.RouteEntity({
            id: row.id,
            name: row.name,
            description: row.description,
            duration: row.duration,
            difficulty: row.difficulty,
            color: row.color || '#eab308',
            coordinates: row.coordinates,
        });
    }
    async findAll() {
        const rows = await prisma_service_1.prisma.route.findMany({
            orderBy: { id: 'desc' },
        });
        return rows.map((r) => this.mapRowToEntity(r));
    }
    async create(data) {
        const row = await prisma_service_1.prisma.route.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                duration: data.duration ?? null,
                difficulty: data.difficulty ?? null,
                color: data.color || '#eab308',
                coordinates: (data.geojson ?? { type: 'LineString', coordinates: [] }),
            },
        });
        return this.mapRowToEntity(row);
    }
    async update(id, data) {
        const existing = await prisma_service_1.prisma.route.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma_service_1.prisma.route.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description ?? null,
                duration: data.duration ?? null,
                difficulty: data.difficulty ?? null,
                color: data.color || '#eab308',
                coordinates: (data.geojson ?? existing.coordinates),
            },
        });
        return this.mapRowToEntity(row);
    }
    async delete(id) {
        const existing = await prisma_service_1.prisma.route.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma_service_1.prisma.route.delete({ where: { id } });
        return this.mapRowToEntity(row);
    }
}
exports.PrismaRouteRepository = PrismaRouteRepository;
