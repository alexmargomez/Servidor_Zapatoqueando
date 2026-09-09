const pool = require('../config/db');

class PosterRepository {
    async getAll() {
        const result = await pool.query('SELECT * FROM posters');
        return result.rows;
    }
}

module.exports = new PosterRepository();
