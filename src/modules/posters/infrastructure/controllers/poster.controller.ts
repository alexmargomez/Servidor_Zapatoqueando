import { Request, Response } from 'express';
import { GetPostersUseCase } from '../../application/use-cases/get-posters.use-case';
import { CreatePosterUseCase } from '../../application/use-cases/create-poster.use-case';
import { UpdatePosterUseCase } from '../../application/use-cases/update-poster.use-case';
import { DeletePosterUseCase } from '../../application/use-cases/delete-poster.use-case';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PosterController {
  constructor(
    private readonly getPostersUseCase: GetPostersUseCase,
    private readonly createPosterUseCase: CreatePosterUseCase,
    private readonly updatePosterUseCase: UpdatePosterUseCase,
    private readonly deletePosterUseCase: DeletePosterUseCase
  ) {}

  getPosters = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.getPostersUseCase.execute();
      res.json({ message: 'success', data });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  createPoster = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.createPosterUseCase.execute(req.body);
      res.status(201).json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  updatePoster = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await this.updatePosterUseCase.execute(id, req.body);
      res.json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  deletePoster = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await this.deletePosterUseCase.execute(id);
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
