import { prisma } from '../../../../shared/infrastructure/database/prisma.service';
import { UserRepositoryPort } from '../../application/ports/repositories/user-repository.port';
import { UserEntity } from '../../domain/entities/user.entity';

export class PrismaUserRepository implements UserRepositoryPort {
  async findByUsername(username: string): Promise<UserEntity | null> {
    const row = await prisma.user.findUnique({
      where: { username },
    });
    if (!row) return null;

    return new UserEntity({
      id: row.id,
      username: row.username,
      passwordHash: row.password,
      role: row.role || 'admin',
    });
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }

  async create(data: { username: string; passwordHash: string; role?: string }): Promise<UserEntity> {
    const row = await prisma.user.create({
      data: {
        username: data.username,
        password: data.passwordHash,
        role: data.role || 'admin',
      },
    });

    return new UserEntity({
      id: row.id,
      username: row.username,
      passwordHash: row.password,
      role: row.role || 'admin',
    });
  }
}
