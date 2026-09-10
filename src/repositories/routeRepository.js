const pool = require('../config/db');

class RouteRepository {
    async getAll() {
        const result = await pool.query('SELECT id, name, description, duration, difficulty, color, coordinates FROM routes ORDER BY id DESC');
        return result.rows.map(r => {
            const geo = r.coordinates || { type: "LineString", coordinates: [] };
            return {
                type: "Feature",
                geometry: geo,
                properties: {
                    id: r.id,
                    route_id: r.id,
                    name: r.name,
                    description: r.description,
                    duration: r.duration,
                    difficulty: r.difficulty,
                    color: r.color
                }
            };
        });
    }

    async create(data) {
        const { name, description, duration, difficulty, color, geojson } = data;
        const result = await pool.query(
            'INSERT INTO routes (name, description, duration, difficulty, color, coordinates) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, duration, difficulty, color, geojson]
        );
        return result.rows[0];
    }

    async update(id, data) {
        const { name, description, duration, difficulty, color, geojson } = data;
        const result = await pool.query(
            'UPDATE routes SET name = $1, description = $2, duration = $3, difficulty = $4, color = $5, coordinates = $6 WHERE id = $7 RETURNING *',
            [name, description, duration, difficulty, color, geojson, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = new RouteRepository();
