import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PlaceNotFoundException extends DomainException {
  constructor(message = 'Place not found') {
    super(message, 404);
  }
}
