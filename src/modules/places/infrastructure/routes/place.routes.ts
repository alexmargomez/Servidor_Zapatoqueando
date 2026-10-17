import { Router } from 'express';
import { PrismaPlaceRepository } from '../repositories/prisma-place.repository';
import { GetPlacesUseCase } from '../../application/use-cases/get-places.use-case';
import { CreatePlaceUseCase } from '../../application/use-cases/create-place.use-case';
import { UpdatePlaceUseCase } from '../../application/use-cases/update-place.use-case';
import { DeletePlaceUseCase } from '../../application/use-cases/delete-place.use-case';
import { PlaceController } from '../controllers/place.controller';
import { verifyToken } from '../../../../shared/infrastructure/http/middlewares/auth.middleware';
import { uploadImageMiddleware } from '../../../../shared/infrastructure/http/middlewares/upload.middleware';

const placeRepository = new PrismaPlaceRepository();
const getPlacesUseCase = new GetPlacesUseCase(placeRepository);
const createPlaceUseCase = new CreatePlaceUseCase(placeRepository);
const updatePlaceUseCase = new UpdatePlaceUseCase(placeRepository);
const deletePlaceUseCase = new DeletePlaceUseCase(placeRepository);

const placeController = new PlaceController(
  getPlacesUseCase,
  createPlaceUseCase,
  updatePlaceUseCase,
  deletePlaceUseCase
);

export const placeRouter = Router();

placeRouter.get('/', placeController.getPlaces);
placeRouter.post('/', verifyToken, uploadImageMiddleware.single('image'), placeController.createPlace);
placeRouter.put('/:id', verifyToken, uploadImageMiddleware.single('image'), placeController.updatePlace);
placeRouter.delete('/:id', verifyToken, placeController.deletePlace);
