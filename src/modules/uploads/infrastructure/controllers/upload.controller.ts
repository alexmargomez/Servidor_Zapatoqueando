import { Request, Response } from 'express';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class UploadController {
  constructor(private readonly uploadImageUseCase: UploadImageUseCase) {}

  uploadImage = (req: Request, res: Response): void => {
    try {
      const result = this.uploadImageUseCase.execute(req.file?.filename);
      res.status(200).json(result);
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      console.error('Upload Error:', err);
      res.status(500).json({ error: 'Error al subir la imagen' });
    }
  };
}
