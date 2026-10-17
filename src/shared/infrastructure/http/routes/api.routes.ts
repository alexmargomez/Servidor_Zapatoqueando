import { Router } from 'express';
import { authRouter } from '../../../../modules/users/infrastructure/routes/auth.routes';
import { posterRouter } from '../../../../modules/posters/infrastructure/routes/poster.routes';
import { placeRouter } from '../../../../modules/places/infrastructure/routes/place.routes';
import { routeRouter } from '../../../../modules/routes/infrastructure/routes/route.routes';
import { streetRouter } from '../../../../modules/streets/infrastructure/routes/street.routes';
import { uploadRouter } from '../../../../modules/uploads/infrastructure/routes/upload.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/posters', posterRouter);
apiRouter.use('/places', placeRouter);
apiRouter.use('/routes', routeRouter);
apiRouter.use('/streets', streetRouter);
apiRouter.use('/upload', uploadRouter);
