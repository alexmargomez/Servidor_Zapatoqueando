import { UploadImageUseCase } from '../../../src/modules/uploads/application/use-cases/upload-image.use-case';
import { FileStorageServicePort } from '../../../src/modules/uploads/application/ports/services/file-storage.service.port';
import { InvalidUploadException } from '../../../src/modules/uploads/domain/exceptions/invalid-upload.exception';

describe('UploadImageUseCase', () => {
  let storageService: jest.Mocked<FileStorageServicePort>;
  let useCase: UploadImageUseCase;

  beforeEach(() => {
    storageService = {
      getPublicUploadUrl: jest.fn((filename: string) => `/uploads/${filename}`),
    };
    useCase = new UploadImageUseCase(storageService);
  });

  it('should return public imageUrl when a valid filename is provided', () => {
    const result = useCase.execute('1700000-foto.png');

    expect(storageService.getPublicUploadUrl).toHaveBeenCalledWith('1700000-foto.png');
    expect(result).toEqual({ imageUrl: '/uploads/1700000-foto.png' });
  });

  it('should throw InvalidUploadException when filename is missing or empty', () => {
    expect(() => useCase.execute(undefined)).toThrow(InvalidUploadException);
    expect(() => useCase.execute('')).toThrow(InvalidUploadException);
  });
});
