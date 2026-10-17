"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPosterRepository = void 0;
const prisma_service_1 = require("../../../../shared/infrastructure/database/prisma.service");
const poster_entity_1 = require("../../domain/entities/poster.entity");
class PrismaPosterRepository {
    mapRowToEntity(row) {
        return new poster_entity_1.PosterEntity({
            id: row.id,
            title: row.title,
            description: row.description,
            imageUrl: row.imageurl || row.image_url,
            type: row.type || 'event',
            orderIndex: row.order_index,
        });
    }
    async findAll() {
        const rows = await prisma_service_1.prisma.poster.findMany({
            orderBy: { id: 'desc' },
        });
        return rows.map((r) => this.mapRowToEntity(r));
    }
    async create(data) {
        const row = await prisma_service_1.prisma.poster.create({
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
    async update(id, data) {
        const existing = await prisma_service_1.prisma.poster.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma_service_1.prisma.poster.update({
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
    async delete(id) {
        const existing = await prisma_service_1.prisma.poster.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma_service_1.prisma.poster.delete({ where: { id } });
        return this.mapRowToEntity(row);
    }
}
exports.PrismaPosterRepository = PrismaPosterRepository;
