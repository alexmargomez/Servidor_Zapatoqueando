import { Router } from 'express';
import { PrismaStreetRepository } from '../repositories/prisma-street.repository';
import { GetStreetsUseCase } from '../../application/use-cases/get-streets.use-case';
import { StreetController } from '../controllers/street.controller';

const streetRepository = new PrismaStreetRepository();
const getStreetsUseCase = new GetStreetsUseCase(streetRepository);
const streetController = new StreetController(getStreetsUseCase);

export const streetRouter = Router();

streetRouter.get('/', streetController.getStreets);
