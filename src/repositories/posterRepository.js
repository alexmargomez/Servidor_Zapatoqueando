const pool = require('../config/db');

class PosterRepository {
    async getAll() {
        const result = await pool.query('SELECT * FROM posters ORDER BY id DESC');
        return result.rows;
    }

    async create(data) {
        const { title, description, imageUrl, type } = data;
        const result = await pool.query(
            'INSERT INTO posters (title, description, imageUrl, type) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, imageUrl, type]
        );
        return result.rows[0];
    }

    async update(id, data) {
        const { title, description, imageUrl, type } = data;
        const result = await pool.query(
            'UPDATE posters SET title = $1, description = $2, imageUrl = $3, type = $4 WHERE id = $5 RETURNING *',
            [title, description, imageUrl, type, id]
        );
        return result.rows[0];
    }

    async delete(id) {
        const result = await pool.query('DELETE FROM posters WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = new PosterRepository();
