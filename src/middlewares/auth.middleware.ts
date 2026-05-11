import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ status: 'error', message: 'No token provided' });
    return;
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};
