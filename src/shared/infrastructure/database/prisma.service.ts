import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

export function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return process.env.DATABASE_URL.trim();
  }

  const user = encodeURIComponent(process.env.POSTGRES_USER || 'admin');
  const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || 'password123');
  const host = process.env.POSTGRES_HOST || 'zapatoqueando-db';
  const port = process.env.POSTGRES_PORT || '5432';
  const database = encodeURIComponent(process.env.POSTGRES_DB || 'zapatoqueando');

  const url = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
  process.env.DATABASE_URL = url;
  return url;
}

const databaseUrl = buildDatabaseUrl();

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
