"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRouteUseCase = void 0;
const route_color_vo_1 = require("../../domain/value-objects/route-color.vo");
const route_not_found_exception_1 = require("../../domain/exceptions/route-not-found.exception");
class UpdateRouteUseCase {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    async execute(id, dto) {
        const colorVo = new route_color_vo_1.RouteColorVO(dto.color);
        const updated = await this.routeRepository.update(id, {
            name: dto.name,
            description: dto.description ?? null,
            duration: dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null,
            difficulty: dto.difficulty ?? null,
            color: colorVo.value,
            geojson: dto.geojson || dto.coordinates || { type: 'LineString', coordinates: [] },
        });
        if (!updated) {
            throw new route_not_found_exception_1.RouteNotFoundException('Route not found');
        }
        return updated.toRawRecord();
    }
}
exports.UpdateRouteUseCase = UpdateRouteUseCase;
