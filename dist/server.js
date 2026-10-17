"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const prisma_service_1 = require("./shared/infrastructure/database/prisma.service");
const prisma_user_repository_1 = require("./modules/users/infrastructure/repositories/prisma-user.repository");
const jwt_token_service_1 = require("./modules/users/infrastructure/services/jwt-token.service");
const ensure_default_admin_use_case_1 = require("./modules/users/application/use-cases/ensure-default-admin.use-case");
const PORT = Number(process.env.PORT) || 3000;
async function bootstrap() {
    try {
        await prisma_service_1.prisma.$connect();
        const userRepository = new prisma_user_repository_1.PrismaUserRepository();
        const tokenService = new jwt_token_service_1.JwtTokenService();
        const ensureDefaultAdmin = new ensure_default_admin_use_case_1.EnsureDefaultAdminUseCase(userRepository, tokenService);
        await ensureDefaultAdmin.execute();
        console.log('Connected to PostgreSQL via Prisma ORM (Hexagonal Architecture).');
    }
    catch (err) {
        console.error('Error connecting to PostgreSQL via Prisma:', err);
    }
}
app_1.app.listen(PORT, async () => {
    await bootstrap();
    console.log(`Server is running on port ${PORT}`);
});
