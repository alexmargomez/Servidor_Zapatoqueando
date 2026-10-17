import { FileStorageServicePort } from '../ports/services/file-storage.service.port';
import { InvalidUploadException } from '../../domain/exceptions/invalid-upload.exception';

export class UploadImageUseCase {
  constructor(private readonly storageService: FileStorageServicePort) {}

  execute(filename?: string): { imageUrl: string } {
    if (!filename) {
      throw new InvalidUploadException('No se proporcionó ninguna imagen');
    }
    return {
      imageUrl: this.storageService.getPublicUploadUrl(filename),
    };
  }
}
