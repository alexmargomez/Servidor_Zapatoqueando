import { UserEntity } from '../../../domain/entities/user.entity';

export interface UserRepositoryPort {
  findByUsername(username: string): Promise<UserEntity | null>;
  count(): Promise<number>;
  create(data: { username: string; passwordHash: string; role?: string }): Promise<UserEntity>;
}
