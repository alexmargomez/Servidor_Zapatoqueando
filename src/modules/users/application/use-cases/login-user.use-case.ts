import { UserRepositoryPort } from '../ports/repositories/user-repository.port';
import { TokenGeneratorServicePort } from '../ports/services/token-generator.service.port';
import { UsernameVO } from '../../domain/value-objects/username.vo';
import {
  InvalidCredentialsException,
  MissingCredentialsException,
} from '../../domain/exceptions/invalid-credentials.exception';

export interface LoginInput {
  email?: string;
  username?: string;
  password?: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenGeneratorServicePort
  ) {}

  async execute(input: LoginInput): Promise<{ token: string }> {
    const rawUsername = input.email || input.username || '';
    const password = input.password || '';

    if (!rawUsername || !password) {
      throw new MissingCredentialsException('Email and password are required');
    }

    const usernameVo = new UsernameVO(rawUsername);
    const user = await this.userRepository.findByUsername(usernameVo.value);
    if (!user) {
      throw new InvalidCredentialsException('Invalid credentials');
    }

    const isMatch = await this.tokenService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new InvalidCredentialsException('Invalid credentials');
    }

    const token = this.tokenService.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return { token };
  }
}
