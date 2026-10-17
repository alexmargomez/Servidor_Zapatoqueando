import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PosterNotFoundException extends DomainException {
  constructor(message = 'Poster not found') {
    super(message, 404);
  }
}
