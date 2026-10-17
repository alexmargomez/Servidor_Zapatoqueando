"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const prisma_service_1 = require("./prisma.service");
const prisma_street_repository_1 = require("../../../modules/streets/infrastructure/repositories/prisma-street.repository");
const seed_streets_use_case_1 = require("../../../modules/streets/application/use-cases/seed-streets.use-case");
const prisma_user_repository_1 = require("../../../modules/users/infrastructure/repositories/prisma-user.repository");
const jwt_token_service_1 = require("../../../modules/users/infrastructure/services/jwt-token.service");
const ensure_default_admin_use_case_1 = require("../../../modules/users/application/use-cases/ensure-default-admin.use-case");
async function runMigrations() {
    console.log('🚀 Iniciando sincronización de esquema y migraciones con Prisma ORM...');
    try {
        await prisma_service_1.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin'
      );
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS posters (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        imageurl TEXT,
        image_url TEXT,
        type VARCHAR(50) DEFAULT 'event',
        order_index INTEGER DEFAULT 0
      );
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      ALTER TABLE posters
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS imageurl TEXT,
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'event',
      ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'posters' AND column_name = 'image_url'
        ) THEN
          ALTER TABLE posters ALTER COLUMN image_url DROP NOT NULL;
          UPDATE posters SET imageurl = image_url WHERE imageurl IS NULL AND image_url IS NOT NULL;
        END IF;
      END $$;
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
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
        category VARCHAR(50) DEFAULT 'Lugares turísticos',
        description TEXT
      );
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      ALTER TABLE places
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        duration VARCHAR(50),
        difficulty VARCHAR(20),
        color VARCHAR(7) DEFAULT '#eab308',
        coordinates JSONB NOT NULL
      );
    `);
        await prisma_service_1.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS streets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        geojson JSONB NOT NULL
      );
    `);
        // Semilla de calles OSM
        const streetRepository = new prisma_street_repository_1.PrismaStreetRepository();
        const seedStreetsUseCase = new seed_streets_use_case_1.SeedStreetsUseCase(streetRepository);
        await seedStreetsUseCase.execute();
        // Usuario administrador por defecto
        const userRepository = new prisma_user_repository_1.PrismaUserRepository();
        const tokenService = new jwt_token_service_1.JwtTokenService();
        const ensureDefaultAdminUseCase = new ensure_default_admin_use_case_1.EnsureDefaultAdminUseCase(userRepository, tokenService);
        await ensureDefaultAdminUseCase.execute();
        console.log('🎉 Esquema Prisma y datos iniciales verificados correctamente.');
    }
    catch (error) {
        console.error('❌ Error fatal en las migraciones Prisma:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    runMigrations()
        .then(async () => {
        await prisma_service_1.prisma.$disconnect();
    })
        .catch(async (err) => {
        console.error(err);
        await prisma_service_1.prisma.$disconnect();
        process.exit(1);
    });
}
