"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlaceUseCase = void 0;
const coordinates_vo_1 = require("../../domain/value-objects/coordinates.vo");
const place_not_found_exception_1 = require("../../domain/exceptions/place-not-found.exception");
class UpdatePlaceUseCase {
    placeRepository;
    constructor(placeRepository) {
        this.placeRepository = placeRepository;
    }
    async execute(id, dto) {
        const coords = new coordinates_vo_1.CoordinatesVO(dto.lat, dto.lng);
        const updated = await this.placeRepository.update(id, {
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
        if (!updated) {
            throw new place_not_found_exception_1.PlaceNotFoundException('Place not found');
        }
        return updated.toRawRecord();
    }
}
exports.UpdatePlaceUseCase = UpdatePlaceUseCase;
