const fs = require('fs');
const osmtogeojson = require('osmtogeojson');
const axios = require('axios');
const path = require('path');

async function fetchBoundary() {
    const overpassQuery = `
        [out:json][timeout:60];
        relation(1315084);
        out body;
        >;
        out skel qt;
    `;
    
    console.log('Fetching boundary data from Overpass API...');
    try {
        const params = new URLSearchParams();
        params.append('data', overpassQuery);
        
        const response = await axios.post('https://overpass-api.de/api/interpreter', params);
        
        console.log('Converting to GeoJSON...');
        const geojson = osmtogeojson(response.data);
        
        // Filter out everything except the Polygon/MultiPolygon
        geojson.features = geojson.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');
        
        const outputPath = path.join(__dirname, 'public', 'zapatoca_boundary.geojson');
        fs.writeFileSync(outputPath, JSON.stringify(geojson));
        console.log(`Saved boundary to ${outputPath}`);
    } catch (err) {
        console.error('Error fetching boundary:', err.message);
    }
}

fetchBoundary();
