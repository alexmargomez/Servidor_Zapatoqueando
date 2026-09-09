const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://admin:password123@localhost:5432/zapatoqueando',
});

async function seed() {
    try {
        await pool.query('TRUNCATE TABLE routes');
        
        const routes = [
            {
                name: "Ruta del Café",
                geojson: {
                    type: "Feature",
                    properties: { name: "Ruta del Café" },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [-73.268689, 6.816801], // Town center
                            [-73.265000, 6.815000],
                            [-73.260000, 6.810000],
                            [-73.255000, 6.808000]  // Coffee farm area
                        ]
                    }
                }
            },
            {
                name: "Caminata vuelta al pueblo",
                geojson: {
                    type: "Feature",
                    properties: { name: "Caminata vuelta al pueblo" },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [-73.268689, 6.816801],
                            [-73.270000, 6.818000],
                            [-73.272000, 6.815000],
                            [-73.268000, 6.812000],
                            [-73.265000, 6.814000],
                            [-73.268689, 6.816801] // Loop back
                        ]
                    }
                }
            },
            {
                name: "Senderismo al Mirador",
                geojson: {
                    type: "Feature",
                    properties: { name: "Senderismo al Mirador" },
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [-73.268689, 6.816801], // Town
                            [-73.269500, 6.818500],
                            [-73.270000, 6.820000], // Mirador Los Guanes
                            [-73.271000, 6.819000], // Mountain side
                            [-73.269000, 6.817500],
                            [-73.268689, 6.816801]  // Back to town
                        ]
                    }
                }
            }
        ];

        for (const route of routes) {
            await pool.query('INSERT INTO routes (name, geojson) VALUES ($1, $2)', [route.name, route.geojson]);
        }
        console.log('Successfully seeded tourism routes.');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

seed();
