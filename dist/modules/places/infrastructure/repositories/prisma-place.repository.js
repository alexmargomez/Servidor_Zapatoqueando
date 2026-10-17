"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPlaceRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_service_1 = require("../../../../shared/infrastructure/database/prisma.service");
const place_entity_1 = require("../../domain/entities/place.entity");
class PrismaPlaceRepository {
    mapRowToEntity(row) {
        return new place_entity_1.PlaceEntity({
            id: row.id,
            placeId: row.place_id,
            name: row.name,
            rating: row.rating,
            userRatingsTotal: row.user_ratings_total,
            formattedAddress: row.formatted_address,
            imageUrl: row.image_url,
            lat: row.lat,
            lng: row.lng,
            category: row.category || 'Lugares turísticos',
            description: row.description,
        });
    }
    async findAll() {
        const rows = await prisma_service_1.prisma.place.findMany({
            orderBy: { id: 'asc' },
        });
        return rows.map((r) => this.mapRowToEntity(r));
    }
    async create(data) {
        const row = await prisma_service_1.prisma.place.create({
            data: {
                place_id: data.place_id || crypto_1.default.randomUUID(),
                name: data.name,
                rating: data.rating ?? null,
                user_ratings_total: data.user_ratings_total ?? null,
                formatted_address: data.formatted_address ?? null,
                image_url: data.image_url ?? null,
                lat: data.lat ?? null,
                lng: data.lng ?? null,
                category: data.category || 'Lugares turísticos',
                description: data.description ?? null,
            },
        });
        return this.mapRowToEntity(row);
    }
    async update(id, data) {
        const existing = await prisma_service_1.prisma.place.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma_service_1.prisma.place.update({
            where: { id },
            data: {
                name: data.name,
                rating: data.rating ?? null,
                user_ratings_total: data.user_ratings_total ?? null,
                formatted_address: data.formatted_address ?? null,
                image_url: data.image_url !== undefined ? data.image_url : existing.image_url,
                lat: data.lat ?? null,
                lng: data.lng ?? null,
                category: data.category || 'Lugares turísticos',
                description: data.description ?? null,
            },
        });
        return this.mapRowToEntity(row);
    }
    async delete(id) {
        const existing = await prisma_service_1.prisma.place.findUnique({ where: { id } });
        if (!existing)
            return null;
        const row = await prisma_service_1.prisma.place.delete({ where: { id } });
        return this.mapRowToEntity(row);
    }
}
exports.PrismaPlaceRepository = PrismaPlaceRepository;
