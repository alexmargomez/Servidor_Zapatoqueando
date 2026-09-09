const pool = require('../config/db');

class RouteRepository {
    async getAll() {
        const result = await pool.query('SELECT geojson FROM routes');
        return result.rows.map(r => r.geojson);
    }
}

module.exports = new RouteRepository();
