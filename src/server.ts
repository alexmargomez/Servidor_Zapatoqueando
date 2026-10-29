import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { prisma } from './shared/infrastructure/database/prisma.service';
import { PrismaUserRepository } from './modules/users/infrastructure/repositories/prisma-user.repository';
import { JwtTokenService, resolveJwtSecret } from './modules/users/infrastructure/services/jwt-token.service';
import { EnsureDefaultAdminUseCase } from './modules/users/application/use-cases/ensure-default-admin.use-case';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  resolveJwtSecret();
  await prisma.$connect();
  const userRepository = new PrismaUserRepository();
  const tokenService = new JwtTokenService();
  const ensureDefaultAdmin = new EnsureDefaultAdminUseCase(userRepository, tokenService);
  await ensureDefaultAdmin.execute();
  console.log('Connected to PostgreSQL via Prisma ORM (Hexagonal Architecture).');
}

bootstrap()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Fatal error during server bootstrap:', err);
    process.exit(1);
  });
