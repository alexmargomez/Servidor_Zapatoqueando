import { Router } from 'express';
import { PrismaPosterRepository } from '../repositories/prisma-poster.repository';
import { GetPostersUseCase } from '../../application/use-cases/get-posters.use-case';
import { CreatePosterUseCase } from '../../application/use-cases/create-poster.use-case';
import { UpdatePosterUseCase } from '../../application/use-cases/update-poster.use-case';
import { DeletePosterUseCase } from '../../application/use-cases/delete-poster.use-case';
import { PosterController } from '../controllers/poster.controller';
import { verifyToken } from '../../../../shared/infrastructure/http/middlewares/auth.middleware';

const posterRepository = new PrismaPosterRepository();
const getPostersUseCase = new GetPostersUseCase(posterRepository);
const createPosterUseCase = new CreatePosterUseCase(posterRepository);
const updatePosterUseCase = new UpdatePosterUseCase(posterRepository);
const deletePosterUseCase = new DeletePosterUseCase(posterRepository);

const posterController = new PosterController(
  getPostersUseCase,
  createPosterUseCase,
  updatePosterUseCase,
  deletePosterUseCase
);

export const posterRouter = Router();

posterRouter.get('/', posterController.getPosters);
posterRouter.post('/', verifyToken, posterController.createPoster);
posterRouter.put('/:id', verifyToken, posterController.updatePoster);
posterRouter.delete('/:id', verifyToken, posterController.deletePoster);
