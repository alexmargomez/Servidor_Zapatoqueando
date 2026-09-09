require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

async function initDB() {
    try {
        // --- USERS TABLE ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // Insert default admin user if none exists
        const resUsers = await pool.query('SELECT count(*) FROM users');
        if (parseInt(resUsers.rows[0].count) === 0) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123!', salt);
            await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', ['admin@zapatoqueando.com', hashedPassword]);
            console.log('Default admin user created.');
        }

        // --- POSTERS TABLE ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posters (
                id SERIAL PRIMARY KEY,
                title TEXT,
                description TEXT,
                imageUrl TEXT,
                type TEXT
            )
        `);

        // --- PLACES TABLE ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS places (
                id SERIAL PRIMARY KEY,
                name TEXT,
                rating REAL,
                user_ratings_total INTEGER,
                formatted_address TEXT,
                image_url TEXT,
                lat REAL,
                lng REAL,
                category VARCHAR(50) DEFAULT 'Lugares turísticos'
            )
        `);

        try {
            await pool.query(`ALTER TABLE places ADD COLUMN category VARCHAR(50) DEFAULT 'Lugares turísticos'`);
            await pool.query(`UPDATE places SET category = 'Lugares turísticos' WHERE category IS NULL`);
            await pool.query(`ALTER TABLE places DROP COLUMN featured`);
        } catch (e) {}

        // --- ROUTES TABLE ---
        await pool.query(`
            CREATE TABLE IF NOT EXISTS routes (
                id SERIAL PRIMARY KEY,
                name TEXT,
                description TEXT,
                duration INTEGER,
                difficulty TEXT,
                color TEXT,
                geojson JSONB
            )
        `);

        try {
            await pool.query(`ALTER TABLE routes ADD COLUMN description TEXT`);
            await pool.query(`ALTER TABLE routes ADD COLUMN duration INTEGER`);
            await pool.query(`ALTER TABLE routes ADD COLUMN difficulty TEXT`);
            await pool.query(`ALTER TABLE routes ADD COLUMN color TEXT`);
        } catch (e) {}

        console.log('Connected to PostgreSQL and database initialized.');
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
}

app.listen(PORT, async () => {
    await initDB();
    console.log(`Server is running on port ${PORT}`);
});
