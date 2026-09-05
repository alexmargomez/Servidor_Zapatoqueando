const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database (In-memory for now, could be a file)
const dbPath = path.join(__dirname, 'zapatoqueando.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create Posters table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS posters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            imageUrl TEXT,
            type TEXT
        )`, (err) => {
            if (!err) {
                // Seed initial data if table is empty
                db.get("SELECT count(*) as count FROM posters", (err, row) => {
                    if (row && row.count === 0) {
                        const stmt = db.prepare("INSERT INTO posters (title, description, imageUrl, type) VALUES (?, ?, ?, ?)");
                        stmt.run("Festival de la Cultura", "Únete a nosotros para celebrar el festival anual con danzas tradicionales y música en vivo en la plaza principal.", "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80", "event");
                        stmt.run("Cueva del Nitro", "Explora las profundidades de la cueva más famosa de la región. Se requiere equipo y guía certificado.", "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80", "event");
                        stmt.run("Café La Casona", "El mejor café de origen cultivado en nuestras montañas. Disfruta de un ambiente colonial único.", "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80", "business");
                        stmt.run("Hotel Mirador", "Descansa con la mejor vista al cañón. Reservas abiertas para la próxima temporada de vacaciones.", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", "business");
                        stmt.finalize();
                    }
                });
            }
        });

        // Create Places table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            rating REAL,
            user_ratings_total INTEGER,
            formatted_address TEXT,
            image_url TEXT,
            lat REAL,
            lng REAL
        )`, (err) => {
            if (!err) {
                // Seed initial data if table is empty
                db.get("SELECT count(*) as count FROM places", (err, row) => {
                    if (row && row.count === 0) {
                        const stmt = db.prepare("INSERT INTO places (name, rating, user_ratings_total, formatted_address, image_url, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)");
                        stmt.run("Cueva del Nitro", 4.8, 342, "Vía a la Cueva del Nitro, Zapatoca, Santander", "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80", 6.8040, -73.2740);
                        stmt.run("Mirador Los Guanes", 4.9, 815, "Vía Galán, Zapatoca, Santander", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", 6.8200, -73.2700);
                        stmt.run("Iglesia San Joaquín", 4.7, 512, "Plaza Principal, Zapatoca, Santander", "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80", 6.816801, -73.268689);
                        stmt.run("Pozo del Ahogado", 4.6, 230, "Quebrada Zapatoca, Vía a la cascada", "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=800&q=80", 6.8000, -73.2600);
                        stmt.run("Museo del Quijote", 4.9, 145, "Calle 20 # 9-45, Zapatoca, Santander", "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80", 6.8150, -73.2690);
                        stmt.finalize();
                    }
                });
            }
        });
    }
});

// Routes
app.get('/api/posters', (req, res) => {
    db.all("SELECT * FROM posters", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

app.get('/api/places', (req, res) => {
    db.all("SELECT * FROM places", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Reformatear al estilo que espera el frontend
        const places = rows.map(r => ({
            place_id: r.id.toString(),
            name: r.name,
            rating: r.rating,
            user_ratings_total: r.user_ratings_total,
            formatted_address: r.formatted_address,
            image_url: r.image_url,
            location: {
                lat: r.lat,
                lng: r.lng
            }
        }));
        
        res.json({
            message: "success",
            data: places
        });
    });
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
});
