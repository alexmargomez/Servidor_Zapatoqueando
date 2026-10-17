import { UserRepositoryPort } from '../ports/repositories/user-repository.port';
import { TokenGeneratorServicePort } from '../ports/services/token-generator.service.port';

export class EnsureDefaultAdminUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenGeneratorServicePort
  ) {}

  async execute(): Promise<void> {
    const count = await this.userRepository.count();
    if (count === 0) {
      const passwordHash = await this.tokenService.hashPassword('Admin123!');
      await this.userRepository.create({
        username: 'admin',
        passwordHash,
        role: 'admin',
      });
      console.log('Default admin user created.');
    }
  }
}
