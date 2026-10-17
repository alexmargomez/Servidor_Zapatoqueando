"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const prisma_service_1 = require("../../../../shared/infrastructure/database/prisma.service");
const user_entity_1 = require("../../domain/entities/user.entity");
class PrismaUserRepository {
    async findByUsername(username) {
        const row = await prisma_service_1.prisma.user.findUnique({
            where: { username },
        });
        if (!row)
            return null;
        return new user_entity_1.UserEntity({
            id: row.id,
            username: row.username,
            passwordHash: row.password,
            role: row.role || 'admin',
        });
    }
    async count() {
        return prisma_service_1.prisma.user.count();
    }
    async create(data) {
        const row = await prisma_service_1.prisma.user.create({
            data: {
                username: data.username,
                password: data.passwordHash,
                role: data.role || 'admin',
            },
        });
        return new user_entity_1.UserEntity({
            id: row.id,
            username: row.username,
            passwordHash: row.password,
            role: row.role || 'admin',
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
