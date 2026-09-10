module.exports = {
    async up(pool) {
        // Tabla de Usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin'
            )
        `);

        // Tabla de Posters/Slider
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posters (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                image_url TEXT NOT NULL,
                order_index INTEGER DEFAULT 0
            )
        `);

        // Tabla de Lugares (Places) con categorización
        await pool.query(`
            CREATE TABLE IF NOT EXISTS places (
                id SERIAL PRIMARY KEY,
                place_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                rating REAL,
                user_ratings_total INTEGER,
                formatted_address TEXT,
                image_url TEXT,
                lat REAL,
                lng REAL,
                category VARCHAR(50) DEFAULT 'Lugares turísticos'
            )
        `);

        // Tabla de Rutas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS routes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                duration VARCHAR(50),
                difficulty VARCHAR(20),
                color VARCHAR(7) DEFAULT '#eab308',
                coordinates JSONB NOT NULL
            )
        `);
    }
};
