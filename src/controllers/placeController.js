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

    async createPlace(req, res) {
        try {
            const data = await placeRepository.create(req.body);
            res.status(201).json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updatePlace(req, res) {
        try {
            const data = await placeRepository.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ error: "Place not found" });
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deletePlace(req, res) {
        try {
            const data = await placeRepository.delete(req.params.id);
            if (!data) return res.status(404).json({ error: "Place not found" });
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new PlaceController();
