import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class RouteNotFoundException extends DomainException {
  constructor(message = 'Route not found') {
    super(message, 404);
  }
}
