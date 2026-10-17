import { Request, Response } from 'express';
import { GetPlacesUseCase } from '../../application/use-cases/get-places.use-case';
import { CreatePlaceUseCase } from '../../application/use-cases/create-place.use-case';
import { UpdatePlaceUseCase } from '../../application/use-cases/update-place.use-case';
import { DeletePlaceUseCase } from '../../application/use-cases/delete-place.use-case';
import { PlaceDto } from '../dtos/place.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';

export class PlaceController {
  constructor(
    private readonly getPlacesUseCase: GetPlacesUseCase,
    private readonly createPlaceUseCase: CreatePlaceUseCase,
    private readonly updatePlaceUseCase: UpdatePlaceUseCase,
    private readonly deletePlaceUseCase: DeletePlaceUseCase
  ) {}

  getPlaces = async (_req: Request, res: Response): Promise<void> => {
    try {
      const places = await this.getPlacesUseCase.execute();
      res.json({ message: 'success', data: places });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  createPlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const placeData: PlaceDto = { ...req.body };
      if (req.file) {
        placeData.image_url = `/uploads/${req.file.filename}`;
      }
      const data = await this.createPlaceUseCase.execute(placeData);
      res.status(201).json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  updatePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const placeData: PlaceDto = { ...req.body };
      if (req.file) {
        placeData.image_url = `/uploads/${req.file.filename}`;
      }
      const data = await this.updatePlaceUseCase.execute(id, placeData);
      res.json({ message: 'success', data });
    } catch (err: any) {
      if (err instanceof DomainException) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  };

  deletePlace = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await this.deletePlaceUseCase.execute(id);
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
