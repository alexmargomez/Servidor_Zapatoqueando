const pool = require('../config/db');

class StreetRepository {
    async getAll() {
        const result = await pool.query('SELECT geojson FROM streets');
        return result.rows.map(r => r.geojson);
    }
}

module.exports = new StreetRepository();
