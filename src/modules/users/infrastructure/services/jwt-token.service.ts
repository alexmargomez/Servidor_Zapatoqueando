import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  TokenGeneratorServicePort,
  TokenPayload,
} from '../../application/ports/services/token-generator.service.port';

export class JwtTokenService implements TokenGeneratorServicePort {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(
      { id: payload.id, username: payload.username, role: payload.role },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '1d' }
    );
  }

  async comparePassword(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  async hashPassword(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainText, salt);
  }
}
