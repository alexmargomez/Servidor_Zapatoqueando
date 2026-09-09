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
}

module.exports = new PosterController();
