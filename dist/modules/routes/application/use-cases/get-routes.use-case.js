"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoutesUseCase = void 0;
class GetRoutesUseCase {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    async execute() {
        const routes = await this.routeRepository.findAll();
        return routes.map((r) => r.toGeoJsonFeature());
    }
}
exports.GetRoutesUseCase = GetRoutesUseCase;
