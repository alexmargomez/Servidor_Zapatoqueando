import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor(message = 'Invalid credentials') {
    super(message, 401);
  }
}

export class MissingCredentialsException extends DomainException {
  constructor(message = 'Email and password are required') {
    super(message, 400);
  }
}
