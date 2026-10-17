import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { prisma } from './shared/infrastructure/database/prisma.service';
import { PrismaUserRepository } from './modules/users/infrastructure/repositories/prisma-user.repository';
import { JwtTokenService } from './modules/users/infrastructure/services/jwt-token.service';
import { EnsureDefaultAdminUseCase } from './modules/users/application/use-cases/ensure-default-admin.use-case';

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    const userRepository = new PrismaUserRepository();
    const tokenService = new JwtTokenService();
    const ensureDefaultAdmin = new EnsureDefaultAdminUseCase(userRepository, tokenService);
    await ensureDefaultAdmin.execute();
    console.log('Connected to PostgreSQL via Prisma ORM (Hexagonal Architecture).');
  } catch (err) {
    console.error('Error connecting to PostgreSQL via Prisma:', err);
  }
}

app.listen(PORT, async () => {
  await bootstrap();
  console.log(`Server is running on port ${PORT}`);
});
