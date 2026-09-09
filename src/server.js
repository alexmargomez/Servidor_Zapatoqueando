require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 3000;

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posters (
                id SERIAL PRIMARY KEY,
                title TEXT,
                description TEXT,
                imageUrl TEXT,
                type TEXT
            )
        `);

        const resPosters = await pool.query('SELECT count(*) FROM posters');
        if (parseInt(resPosters.rows[0].count) === 0) {
            await pool.query(`INSERT INTO posters (title, description, imageUrl, type) VALUES
                ('Festival de la Cultura', 'Únete a nosotros para celebrar el festival anual con danzas tradicionales y música en vivo en la plaza principal.', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80', 'event'),
                ('Cueva del Nitro', 'Explora las profundidades de la cueva más famosa de la región. Se requiere equipo y guía certificado.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80', 'event'),
                ('Café La Casona', 'El mejor café de origen cultivado en nuestras montañas. Disfruta de un ambiente colonial único.', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80', 'business'),
                ('Hotel Mirador', 'Descansa con la mejor vista al cañón. Reservas abiertas para la próxima temporada de vacaciones.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'business')
            `);
        }

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
                featured BOOLEAN DEFAULT false
            )
        `);

        // Agregar columna 'featured' si la tabla ya existía antes de este cambio
        try {
            await pool.query(`ALTER TABLE places ADD COLUMN featured BOOLEAN DEFAULT false`);
        } catch (e) {
            // Se ignora el error si la columna ya existe
        }

        const resPlaces = await pool.query('SELECT count(*) FROM places');
        if (parseInt(resPlaces.rows[0].count) === 0) {
            await pool.query(`INSERT INTO places (name, rating, user_ratings_total, formatted_address, image_url, lat, lng, featured) VALUES
                ('Cueva del Nitro', 4.8, 342, 'Vía a la Cueva del Nitro, Zapatoca, Santander', 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80', 6.8040, -73.2740, true),
                ('Mirador Los Guanes', 4.9, 815, 'Vía Galán, Zapatoca, Santander', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 6.8200, -73.2700, true),
                ('Iglesia San Joaquín', 4.7, 512, 'Plaza Principal, Zapatoca, Santander', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80', 6.816801, -73.268689, true),
                ('Pozo del Ahogado', 4.6, 230, 'Quebrada Zapatoca, Vía a la cascada', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80', 6.8000, -73.2600, true),
                ('Museo del Quijote', 4.9, 145, 'Calle 20 # 9-45, Zapatoca, Santander', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80', 6.8150, -73.2690, false)
            `);
        } else {
            // Asegurarnos de que las 4 primeras estén destacadas si ya existía la base de datos
            await pool.query(`UPDATE places SET featured = true WHERE id IN (1, 2, 3, 4)`);
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS routes (
                id SERIAL PRIMARY KEY,
                name TEXT,
                geojson JSONB
            )
        `);

        const resRoutes = await pool.query('SELECT count(*) FROM routes');
        if (parseInt(resRoutes.rows[0].count) === 0) {
            console.log('Routes table is empty. Please run the seeder script to populate OSM data.');
        }

        console.log('Connected to PostgreSQL and database initialized.');
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
}

app.listen(PORT, async () => {
    await initDB();
    console.log(`Server is running on port ${PORT}`);
});
