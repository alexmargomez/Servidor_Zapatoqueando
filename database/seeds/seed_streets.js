const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const pool = require('../../src/config/db');

async function seedStreets() {
    try {
        console.log('Reading osm_la_fuente.json...');
        const rawData = fs.readFileSync(path.join(__dirname, 'osm_la_fuente.json'), 'utf8');
        const osmData = JSON.parse(rawData);
        
        console.log('Converting OSM to GeoJSON...');
        const geojson = osmtogeojson(osmData);
        
        console.log('Inserting into PostgreSQL...');
        let count = 0;
        for (const feature of geojson.features) {
            if (feature.properties && feature.properties.name && feature.geometry.type === 'LineString') {
                await pool.query('INSERT INTO routes (name, geojson) VALUES ($1, $2)', [feature.properties.name, feature]);
                count++;
            }
        }
        console.log(`Success! Inserted ${count} streets.`);
    } catch (e) {
        console.error('Error seeding streets:', e);
    } finally {
        pool.end();
    }
}

seedStreets();
