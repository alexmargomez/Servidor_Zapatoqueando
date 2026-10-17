"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlaceUseCase = void 0;
const crypto_1 = __importDefault(require("crypto"));
const coordinates_vo_1 = require("../../domain/value-objects/coordinates.vo");
class CreatePlaceUseCase {
    placeRepository;
    constructor(placeRepository) {
        this.placeRepository = placeRepository;
    }
    async execute(dto) {
        const coords = new coordinates_vo_1.CoordinatesVO(dto.lat, dto.lng);
        const created = await this.placeRepository.create({
            place_id: dto.place_id || crypto_1.default.randomUUID(),
            name: dto.name,
            rating: dto.rating !== undefined && dto.rating !== null ? Number(dto.rating) : null,
            user_ratings_total: dto.user_ratings_total !== undefined && dto.user_ratings_total !== null
                ? Number(dto.user_ratings_total)
                : null,
            formatted_address: dto.formatted_address ?? null,
            image_url: dto.image_url ?? null,
            lat: coords.lat,
            lng: coords.lng,
            category: dto.category || 'Lugares turísticos',
            description: dto.description ?? null,
        });
        return created.toRawRecord();
    }
}
exports.CreatePlaceUseCase = CreatePlaceUseCase;
