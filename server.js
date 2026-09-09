const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const axios = require('axios');
const osmtogeojson = require('osmtogeojson');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://admin:password123@zapatoqueando-db:5432/zapatoqueando',
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

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
        
        console.log('Connected to PostgreSQL and database seeded.');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}

// Routes
app.get('/api/posters', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posters');
        res.json({ message: "success", data: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/places', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM places');
        const places = result.rows.map(r => ({
            place_id: r.id.toString(),
            name: r.name,
            rating: r.rating,
            user_ratings_total: r.user_ratings_total,
            formatted_address: r.formatted_address,
            image_url: r.image_url,
            location: { lat: r.lat, lng: r.lng },
            featured: r.featured
        }));
        res.json({ message: "success", data: places });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/routes', async (req, res) => {
    try {
        const result = await pool.query('SELECT geojson FROM routes');
        const features = result.rows.map(r => r.geojson);
        res.json({
            type: "FeatureCollection",
            features: features
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Servir archivos estáticos del frontend compilado (Vue) sin caché
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    maxAge: 0,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Catch-all para que Vue maneje el enrutamiento si lo agregamos después
app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
    initDB();
});
