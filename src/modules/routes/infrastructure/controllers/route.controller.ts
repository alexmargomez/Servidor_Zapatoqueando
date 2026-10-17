import { Request, Response } from 'express';
import { GetRoutesUseCase } from '../../application/use-cases/get-routes.use-case';
import { CreateRouteUseCase } from '../../application/use-cases/create-route.use-case';
import { UpdateRouteUseCase } from '../../application/use-cases/update-route.use-case';
import { DeleteRouteUseCase } from '../../application/use-cases/delete-route.use-case';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class RouteController {
  constructor(
    private readonly getRoutesUseCase: GetRoutesUseCase,
    private readonly createRouteUseCase: CreateRouteUseCase,
    private readonly updateRouteUseCase: UpdateRouteUseCase,
    private readonly deleteRouteUseCase: DeleteRouteUseCase
  ) {}

  getRoutes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const features = await this.getRoutesUseCase.execute();
      res.json({
        type: 'FeatureCollection',
        features,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  createRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.createRouteUseCase.execute(req.body);
      res.status(201).json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  updateRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await this.updateRouteUseCase.execute(id, req.body);
      res.json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  deleteRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await this.deleteRouteUseCase.execute(id);
      res.json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };
}
