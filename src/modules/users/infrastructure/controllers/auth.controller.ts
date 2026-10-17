import { Request, Response } from 'express';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LoginDto } from '../dtos/login.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class AuthController {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: LoginDto = req.body;
      const { token } = await this.loginUserUseCase.execute(dto);
      res.json({ message: 'success', token });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };
}
