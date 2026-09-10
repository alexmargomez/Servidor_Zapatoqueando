const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

const requiredEnvVars = ['POSTGRES_USER', 'POSTGRES_HOST', 'POSTGRES_DB', 'POSTGRES_PASSWORD', 'POSTGRES_PORT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Error: Variable de entorno ${envVar} no definida.`);
        process.exit(1);
    }
}

// Create a pool manually to avoid requiring the full server app which might rely on tables existing
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

async function runMigrations() {
    console.log('🚀 Iniciando sistema de migraciones...');
    try {
        // Ensure a migrations table exists to track what has run
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (file.endsWith('.js')) {
                // Check if migration already ran
                const { rowCount } = await pool.query('SELECT 1 FROM migrations WHERE name = $1', [file]);
                if (rowCount > 0) {
                    console.log(`✅ Omitiendo migración ya ejecutada: ${file}`);
                    continue;
                }

                console.log(`⏳ Ejecutando migración: ${file}...`);
                const migration = require(path.join(migrationsDir, file));
                
                await pool.query('BEGIN');
                try {
                    await migration.up(pool);
                    await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                    await pool.query('COMMIT');
                    console.log(`✅ Migración exitosa: ${file}`);
                } catch (error) {
                    await pool.query('ROLLBACK');
                    console.error(`❌ Error en la migración ${file}:`, error);
                    throw error;
                }
            }
        }
        console.log('🎉 Todas las migraciones se han ejecutado correctamente.');
    } catch (e) {
        console.error('❌ Error fatal en las migraciones:', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
