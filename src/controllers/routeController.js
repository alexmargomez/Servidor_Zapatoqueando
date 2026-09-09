const routeRepository = require('../repositories/routeRepository');

class RouteController {
    async getRoutes(req, res) {
        try {
            const features = await routeRepository.getAll();
            res.json({
                type: "FeatureCollection",
                features: features
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async createRoute(req, res) {
        try {
            const data = await routeRepository.create(req.body);
            res.status(201).json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateRoute(req, res) {
        try {
            const data = await routeRepository.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ error: "Route not found" });
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deleteRoute(req, res) {
        try {
            const data = await routeRepository.delete(req.params.id);
            if (!data) return res.status(404).json({ error: "Route not found" });
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new RouteController();
