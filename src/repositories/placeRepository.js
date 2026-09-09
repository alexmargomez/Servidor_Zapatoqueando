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
            featured: r.featured
        }));
    }
}

module.exports = new PlaceRepository();
