"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.buildDatabaseUrl = buildDatabaseUrl;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function buildDatabaseUrl() {
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
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});
