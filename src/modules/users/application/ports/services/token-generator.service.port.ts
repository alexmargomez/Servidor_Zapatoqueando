export interface TokenPayload {
  id: number;
  username: string;
  role?: string;
}

export interface TokenGeneratorServicePort {
  generateToken(payload: TokenPayload): string;
  comparePassword(plainText: string, hash: string): Promise<boolean>;
  hashPassword(plainText: string): Promise<string>;
}
