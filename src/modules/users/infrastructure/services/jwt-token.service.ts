import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  TokenGeneratorServicePort,
  TokenPayload,
} from '../../application/ports/services/token-generator.service.port';

const EPHEMERAL_DEV_SECRET = crypto.randomBytes(32).toString('hex');

export function resolveJwtSecret(): string {
  const configured = (process.env.JWT_SECRET || '').trim();
  if (configured) {
    return configured;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is required in production.');
  }
  return EPHEMERAL_DEV_SECRET;
}

export class JwtTokenService implements TokenGeneratorServicePort {
  generateToken(payload: TokenPayload): string {
    return jwt.sign(
      { id: payload.id, username: payload.username, role: payload.role },
      resolveJwtSecret(),
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
