import { LoginUserUseCase } from '../../../src/modules/users/application/use-cases/login-user.use-case';
import { UserRepositoryPort } from '../../../src/modules/users/application/ports/repositories/user-repository.port';
import { TokenGeneratorServicePort } from '../../../src/modules/users/application/ports/services/token-generator.service.port';
import { UserEntity } from '../../../src/modules/users/domain/entities/user.entity';
import {
  InvalidCredentialsException,
  MissingCredentialsException,
} from '../../../src/modules/users/domain/exceptions/invalid-credentials.exception';

describe('LoginUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let tokenService: jest.Mocked<TokenGeneratorServicePort>;
  let loginUserUseCase: LoginUserUseCase;

  beforeEach(() => {
    userRepository = {
      findByUsername: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    };
    tokenService = {
      generateToken: jest.fn(),
      comparePassword: jest.fn(),
      hashPassword: jest.fn(),
    };
    loginUserUseCase = new LoginUserUseCase(userRepository, tokenService);
  });

  it('should authenticate user with valid username and password and return JWT token', async () => {
    const mockUser = new UserEntity({
      id: 1,
      username: 'admin',
      passwordHash: 'hashed_pw',
      role: 'admin',
    });
    userRepository.findByUsername.mockResolvedValue(mockUser);
    tokenService.comparePassword.mockResolvedValue(true);
    tokenService.generateToken.mockReturnValue('mock.jwt.token');

    const result = await loginUserUseCase.execute({
      username: 'admin',
      password: 'Admin123!',
    });

    expect(userRepository.findByUsername).toHaveBeenCalledWith('admin');
    expect(tokenService.comparePassword).toHaveBeenCalledWith('Admin123!', 'hashed_pw');
    expect(tokenService.generateToken).toHaveBeenCalledWith({
      id: 1,
      username: 'admin',
      role: 'admin',
    });
    expect(result).toEqual({ token: 'mock.jwt.token' });
  });

  it('should support email field as alias for username', async () => {
    const mockUser = new UserEntity({
      id: 2,
      username: 'editor@zapatoca.co',
      passwordHash: 'hashed_pw',
      role: 'admin',
    });
    userRepository.findByUsername.mockResolvedValue(mockUser);
    tokenService.comparePassword.mockResolvedValue(true);
    tokenService.generateToken.mockReturnValue('token_email');

    const result = await loginUserUseCase.execute({
      email: '  editor@zapatoca.co ',
      password: 'Secret!',
    });

    expect(userRepository.findByUsername).toHaveBeenCalledWith('editor@zapatoca.co');
    expect(result).toEqual({ token: 'token_email' });
  });

  it('should throw MissingCredentialsException when username or password is missing', async () => {
    await expect(loginUserUseCase.execute({ username: '', password: '123' })).rejects.toThrow(
      MissingCredentialsException
    );
    await expect(loginUserUseCase.execute({ username: 'admin', password: '' })).rejects.toThrow(
      MissingCredentialsException
    );
  });

  it('should throw InvalidCredentialsException when user does not exist', async () => {
    userRepository.findByUsername.mockResolvedValue(null);

    await expect(
      loginUserUseCase.execute({ username: 'unknown', password: '123' })
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw InvalidCredentialsException when password does not match', async () => {
    const mockUser = new UserEntity({
      id: 1,
      username: 'admin',
      passwordHash: 'hashed_pw',
      role: 'admin',
    });
    userRepository.findByUsername.mockResolvedValue(mockUser);
    tokenService.comparePassword.mockResolvedValue(false);

    await expect(
      loginUserUseCase.execute({ username: 'admin', password: 'wrong_password' })
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
