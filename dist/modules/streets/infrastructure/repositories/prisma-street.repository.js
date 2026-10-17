"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaStreetRepository = void 0;
const prisma_service_1 = require("../../../../shared/infrastructure/database/prisma.service");
const street_entity_1 = require("../../domain/entities/street.entity");
class PrismaStreetRepository {
    async findAll() {
        const rows = await prisma_service_1.prisma.street.findMany();
        return rows.map((r) => new street_entity_1.StreetEntity({
            id: r.id,
            name: r.name,
            geojson: r.geojson,
        }));
    }
    async count() {
        return prisma_service_1.prisma.street.count();
    }
    async createMany(items) {
        const res = await prisma_service_1.prisma.street.createMany({
            data: items.map((item) => ({
                name: item.name,
                geojson: item.geojson,
            })),
        });
        return res.count;
    }
}
exports.PrismaStreetRepository = PrismaStreetRepository;
