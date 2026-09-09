const placeRepository = require('../repositories/placeRepository');

class PlaceController {
    async getPlaces(req, res) {
        try {
            const places = await placeRepository.getAll();
            res.json({ message: "success", data: places });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new PlaceController();
