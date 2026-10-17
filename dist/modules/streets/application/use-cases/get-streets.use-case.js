"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStreetsUseCase = void 0;
class GetStreetsUseCase {
    streetRepository;
    constructor(streetRepository) {
        this.streetRepository = streetRepository;
    }
    async execute() {
        const streets = await this.streetRepository.findAll();
        return streets.map((s) => s.geojson);
    }
}
exports.GetStreetsUseCase = GetStreetsUseCase;
