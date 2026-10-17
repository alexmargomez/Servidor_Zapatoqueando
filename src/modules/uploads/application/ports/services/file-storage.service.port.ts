export interface FileStorageServicePort {
  getPublicUploadUrl(filename: string): string;
}
