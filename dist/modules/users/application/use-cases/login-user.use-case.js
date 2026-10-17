"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserUseCase = void 0;
const username_vo_1 = require("../../domain/value-objects/username.vo");
const invalid_credentials_exception_1 = require("../../domain/exceptions/invalid-credentials.exception");
class LoginUserUseCase {
    userRepository;
    tokenService;
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    async execute(input) {
        const rawUsername = input.email || input.username || '';
        const password = input.password || '';
        if (!rawUsername || !password) {
            throw new invalid_credentials_exception_1.MissingCredentialsException('Email and password are required');
        }
        const usernameVo = new username_vo_1.UsernameVO(rawUsername);
        const user = await this.userRepository.findByUsername(usernameVo.value);
        if (!user) {
            throw new invalid_credentials_exception_1.InvalidCredentialsException('Invalid credentials');
        }
        const isMatch = await this.tokenService.comparePassword(password, user.passwordHash);
        if (!isMatch) {
            throw new invalid_credentials_exception_1.InvalidCredentialsException('Invalid credentials');
        }
        const token = this.tokenService.generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
        });
        return { token };
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
