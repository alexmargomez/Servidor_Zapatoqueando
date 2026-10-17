import { MissingCredentialsException } from '../exceptions/invalid-credentials.exception';

export class UsernameVO {
  public readonly value: string;

  constructor(value: string) {
    const cleaned = (value || '').trim();
    if (!cleaned) {
      throw new MissingCredentialsException('Email and password are required');
    }
    this.value = cleaned;
  }
}
