import { Router } from 'express';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { JwtTokenService } from '../services/jwt-token.service';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { AuthController } from '../controllers/auth.controller';

const userRepository = new PrismaUserRepository();
const tokenService = new JwtTokenService();
const loginUserUseCase = new LoginUserUseCase(userRepository, tokenService);
const authController = new AuthController(loginUserUseCase);

export const authRouter = Router();

authRouter.post('/login', authController.login);
