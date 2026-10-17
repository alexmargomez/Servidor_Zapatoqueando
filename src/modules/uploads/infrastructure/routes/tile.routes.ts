import { Router } from 'express';
import { TileController } from '../controllers/tile.controller';

const tileController = new TileController();

export const tileRouter = Router();

tileRouter.get('/:z/:x/:y', tileController.getTile);
