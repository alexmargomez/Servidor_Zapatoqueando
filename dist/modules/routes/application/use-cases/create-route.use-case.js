"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRouteUseCase = void 0;
const route_color_vo_1 = require("../../domain/value-objects/route-color.vo");
class CreateRouteUseCase {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    async execute(dto) {
        const colorVo = new route_color_vo_1.RouteColorVO(dto.color);
        const created = await this.routeRepository.create({
            name: dto.name,
            description: dto.description ?? null,
            duration: dto.duration !== undefined && dto.duration !== null ? String(dto.duration) : null,
            difficulty: dto.difficulty ?? null,
            color: colorVo.value,
            geojson: dto.geojson || dto.coordinates || { type: 'LineString', coordinates: [] },
        });
        return created.toRawRecord();
    }
}
exports.CreateRouteUseCase = CreateRouteUseCase;
