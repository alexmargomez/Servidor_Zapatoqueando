import { EnsureDefaultAdminUseCase } from '../../../src/modules/users/application/use-cases/ensure-default-admin.use-case';
import { UserRepositoryPort } from '../../../src/modules/users/application/ports/repositories/user-repository.port';
import { TokenGeneratorServicePort } from '../../../src/modules/users/application/ports/services/token-generator.service.port';
import { UserEntity } from '../../../src/modules/users/domain/entities/user.entity';

describe('EnsureDefaultAdminUseCase', () => {
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let tokenService: jest.Mocked<TokenGeneratorServicePort>;
  let useCase: EnsureDefaultAdminUseCase;

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
    useCase = new EnsureDefaultAdminUseCase(userRepository, tokenService);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create default admin user when user count is 0', async () => {
    userRepository.count.mockResolvedValue(0);
    tokenService.hashPassword.mockResolvedValue('hashed_default_pw');
    userRepository.create.mockResolvedValue(
      new UserEntity({
        id: 1,
        username: 'admin',
        passwordHash: 'hashed_default_pw',
        role: 'admin',
      })
    );

    await useCase.execute();

    expect(tokenService.hashPassword).toHaveBeenCalledWith('Admin123!');
    expect(userRepository.create).toHaveBeenCalledWith({
      username: 'admin',
      passwordHash: 'hashed_default_pw',
      role: 'admin',
    });
  });

  it('should not create default admin user when users already exist', async () => {
    userRepository.count.mockResolvedValue(3);

    await useCase.execute();

    expect(tokenService.hashPassword).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
