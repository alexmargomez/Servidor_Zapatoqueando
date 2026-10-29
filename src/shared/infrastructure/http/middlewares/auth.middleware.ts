import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { resolveJwtSecret } from '../../../../modules/users/infrastructure/services/jwt-token.service';

export interface AuthenticatedRequest extends Request {
  authData?: jwt.JwtPayload | string;
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, resolveJwtSecret(), (err, authData) => {
      if (err) {
        res.sendStatus(403);
        return;
      }
      req.authData = authData;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}
