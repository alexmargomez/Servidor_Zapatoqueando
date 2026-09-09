const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://admin:password123@localhost:5432/zapatoqueando' });
pool.query(`
    CREATE TABLE IF NOT EXISTS streets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        geojson JSONB NOT NULL
    );
`).then(res => { console.log('Table streets created'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
