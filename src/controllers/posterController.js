const posterRepository = require('../repositories/posterRepository');

class PosterController {
    async getPosters(req, res) {
        try {
            const data = await posterRepository.getAll();
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async createPoster(req, res) {
        try {
            const data = await posterRepository.create(req.body);
            res.status(201).json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updatePoster(req, res) {
        try {
            const data = await posterRepository.update(req.params.id, req.body);
            if (!data) return res.status(404).json({ error: "Poster not found" });
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async deletePoster(req, res) {
        try {
            const data = await posterRepository.delete(req.params.id);
            if (!data) return res.status(404).json({ error: "Poster not found" });
            res.json({ message: "success", data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new PosterController();
