import { Router } from 'express';
import { LocalFileStorageService } from '../services/local-file-storage.service';
import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { UploadController } from '../controllers/upload.controller';
import { verifyToken } from '../../../../shared/infrastructure/http/middlewares/auth.middleware';
import { uploadImageMiddleware } from '../../../../shared/infrastructure/http/middlewares/upload.middleware';

const storageService = new LocalFileStorageService();
const uploadImageUseCase = new UploadImageUseCase(storageService);
const uploadController = new UploadController(uploadImageUseCase);

export const uploadRouter = Router();

uploadRouter.post('/', verifyToken, uploadImageMiddleware.single('image'), uploadController.uploadImage);
