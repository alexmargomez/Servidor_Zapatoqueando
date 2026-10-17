import { Router } from 'express';
import { PrismaRouteRepository } from '../repositories/prisma-route.repository';
import { GetRoutesUseCase } from '../../application/use-cases/get-routes.use-case';
import { CreateRouteUseCase } from '../../application/use-cases/create-route.use-case';
import { UpdateRouteUseCase } from '../../application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from '../../application/use-cases/delete-route.use-case';
import { RouteController } from '../controllers/route.controller';
import { verifyToken } from '../../../../shared/infrastructure/http/middlewares/auth.middleware';

const routeRepository = new PrismaRouteRepository();
const getRoutesUseCase = new GetRoutesUseCase(routeRepository);
const createRouteUseCase = new CreateRouteUseCase(routeRepository);
const updateRouteUseCase = new UpdateRouteUseCase(routeRepository);
const deleteRouteUseCase = new DeleteRouteUseCase(routeRepository);

const routeController = new RouteController(
  getRoutesUseCase,
  createRouteUseCase,
  updateRouteUseCase,
  deleteRouteUseCase
);

export const routeRouter = Router();

routeRouter.get('/', routeController.getRoutes);
routeRouter.post('/', verifyToken, routeController.createRoute);
routeRouter.put('/:id', verifyToken, routeController.updateRoute);
routeRouter.delete('/:id', verifyToken, routeController.deleteRoute);
