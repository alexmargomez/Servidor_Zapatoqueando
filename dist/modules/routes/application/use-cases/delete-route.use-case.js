"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRouteUseCase = void 0;
const route_not_found_exception_1 = require("../../domain/exceptions/route-not-found.exception");
class DeleteRouteUseCase {
    routeRepository;
    constructor(routeRepository) {
        this.routeRepository = routeRepository;
    }
    async execute(id) {
        const deleted = await this.routeRepository.delete(id);
        if (!deleted) {
            throw new route_not_found_exception_1.RouteNotFoundException('Route not found');
        }
        return deleted.toRawRecord();
    }
}
exports.DeleteRouteUseCase = DeleteRouteUseCase;
