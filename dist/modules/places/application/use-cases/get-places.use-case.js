"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPlacesUseCase = void 0;
class GetPlacesUseCase {
    placeRepository;
    constructor(placeRepository) {
        this.placeRepository = placeRepository;
    }
    async execute() {
        const places = await this.placeRepository.findAll();
        return places.map((place) => place.toPublicResponse());
    }
}
exports.GetPlacesUseCase = GetPlacesUseCase;
