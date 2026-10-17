import { FileStorageServicePort } from '../../application/ports/services/file-storage.service.port';

export class LocalFileStorageService implements FileStorageServicePort {
  getPublicUploadUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
