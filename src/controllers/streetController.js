const streetRepository = require('../repositories/streetRepository');

class StreetController {
    async getStreets(req, res) {
        try {
            const features = await streetRepository.getAll();
            res.json({
                type: "FeatureCollection",
                features: features
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new StreetController();
