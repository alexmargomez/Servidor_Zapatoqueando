"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteController = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class RouteController {
    getRoutesUseCase;
    createRouteUseCase;
    updateRouteUseCase;
    deleteRouteUseCase;
    constructor(getRoutesUseCase, createRouteUseCase, updateRouteUseCase, deleteRouteUseCase) {
        this.getRoutesUseCase = getRoutesUseCase;
        this.createRouteUseCase = createRouteUseCase;
        this.updateRouteUseCase = updateRouteUseCase;
        this.deleteRouteUseCase = deleteRouteUseCase;
    }
    getRoutes = async (_req, res) => {
        try {
            const features = await this.getRoutesUseCase.execute();
            res.json({
                type: 'FeatureCollection',
                features,
            });
        }
        catch (err) {
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    createRoute = async (req, res) => {
        try {
            const data = await this.createRouteUseCase.execute(req.body);
            res.status(201).json({ message: 'success', data });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    updateRoute = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const data = await this.updateRouteUseCase.execute(id, req.body);
            res.json({ message: 'success', data });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    deleteRoute = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const data = await this.deleteRouteUseCase.execute(id);
            res.json({ message: 'success', data });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
}
exports.RouteController = RouteController;
