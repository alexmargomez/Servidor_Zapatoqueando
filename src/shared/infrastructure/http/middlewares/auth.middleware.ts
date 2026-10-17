import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  authData?: jwt.JwtPayload | string;
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123', (err, authData) => {
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
