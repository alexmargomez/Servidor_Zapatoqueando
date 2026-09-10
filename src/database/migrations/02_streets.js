const fs = require('fs');
const path = require('path');
const osmtogeojson = require('osmtogeojson');

module.exports = {
    async up(pool) {
        // Create streets table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS streets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                geojson JSONB NOT NULL
            )
        `);

        // Check if we need to seed
        const res = await pool.query('SELECT count(*) FROM streets');
        if (parseInt(res.rows[0].count) > 0) {
            console.log('Las calles ya están pobladas. Omitiendo seed.');
            return;
        }

        // Seed data
        try {
            const dataPath = path.join(__dirname, '../data/osm_la_fuente.json');
            if (fs.existsSync(dataPath)) {
                console.log('Convirtiendo OSM a GeoJSON e insertando calles...');
                const rawData = fs.readFileSync(dataPath, 'utf8');
                const osmData = JSON.parse(rawData);
                const geojson = osmtogeojson(osmData);
                
                let count = 0;
                for (const feature of geojson.features) {
                    if (feature.properties && feature.properties.name && feature.geometry.type === 'LineString') {
                        await pool.query('INSERT INTO streets (name, geojson) VALUES ($1, $2)', [feature.properties.name, feature]);
                        count++;
                    }
                }
                console.log(`Pobladas ${count} calles correctamente.`);
            } else {
                console.log('Archivo osm_la_fuente.json no encontrado, omitiendo poblado de calles.');
            }
        } catch (e) {
            console.error('Error al poblar calles:', e);
            throw e;
        }
    }
};
