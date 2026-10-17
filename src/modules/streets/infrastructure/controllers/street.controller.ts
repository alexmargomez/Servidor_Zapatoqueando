import { Request, Response } from 'express';
import { GetStreetsUseCase } from '../../application/use-cases/get-streets.use-case';

export class StreetController {
  constructor(private readonly getStreetsUseCase: GetStreetsUseCase) {}

  getStreets = async (_req: Request, res: Response): Promise<void> => {
    try {
      const features = await this.getStreetsUseCase.execute();
      res.json({
        type: 'FeatureCollection',
        features,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };
}
