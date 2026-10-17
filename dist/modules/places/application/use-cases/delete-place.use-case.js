"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePlaceUseCase = void 0;
const place_not_found_exception_1 = require("../../domain/exceptions/place-not-found.exception");
class DeletePlaceUseCase {
    placeRepository;
    constructor(placeRepository) {
        this.placeRepository = placeRepository;
    }
    async execute(id) {
        const deleted = await this.placeRepository.delete(id);
        if (!deleted) {
            throw new place_not_found_exception_1.PlaceNotFoundException('Place not found');
        }
        return deleted.toRawRecord();
    }
}
exports.DeletePlaceUseCase = DeletePlaceUseCase;
