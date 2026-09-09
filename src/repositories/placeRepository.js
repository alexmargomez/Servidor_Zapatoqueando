const pool = require('../config/db');

class PlaceRepository {
    async getAll() {
        const result = await pool.query('SELECT * FROM places');
        return result.rows.map(r => ({
            place_id: r.id.toString(),
            name: r.name,
            rating: r.rating,
            user_ratings_total: r.user_ratings_total,
            formatted_address: r.formatted_address,
            image_url: r.image_url,
            location: {
                lat: r.lat,
                lng: r.lng
            },
            category: r.category
        }));
    }

    async create(data) {
        const { name, rating, user_ratings_total, formatted_address, image_url, lat, lng, category } = data;
        const result = await pool.query(
            'INSERT INTO places (name, rating, user_ratings_total, formatted_address, image_url, lat, lng, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, rating, user_ratings_total, formatted_address, image_url, lat, lng, category || 'Lugares turísticos']
        );
        return result.rows[0];
    }

    async update(id, data) {
        const { name, rating, user_ratings_total, formatted_address, image_url, lat, lng, category } = data;
        const result = await pool.query(
            'UPDATE places SET name = $1, rating = $2, user_ratings_total = $3, formatted_address = $4, image_url = $5, lat = $6, lng = $7, category = $8 WHERE id = $9 RETURNING *',
            [name, rating, user_ratings_total, formatted_address, image_url, lat, lng, category || 'Lugares turísticos', id]
        );
        return result.rows[0];
    }

    async delete(id) {
        const result = await pool.query('DELETE FROM places WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = new PlaceRepository();
