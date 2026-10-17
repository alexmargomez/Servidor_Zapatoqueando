"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnsureDefaultAdminUseCase = void 0;
class EnsureDefaultAdminUseCase {
    userRepository;
    tokenService;
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    async execute() {
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
exports.EnsureDefaultAdminUseCase = EnsureDefaultAdminUseCase;
