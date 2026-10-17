import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class InvalidUploadException extends DomainException {
  constructor(message = 'No se proporcionó ninguna imagen') {
    super(message, 400);
  }
}
