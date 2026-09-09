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
}

module.exports = new RouteController();
