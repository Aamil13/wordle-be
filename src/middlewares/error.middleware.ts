import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public extras?: Record<string, any>;
  constructor(
    public message: string,
    public statusCode: number = 500,
    extras?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AppError';
    this.extras = extras;
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(err);
  if (err instanceof AppError) {
    const response: any = {
      status: 'error',
      message: err.message,
    };

    if (err.extras) {
      Object.assign(response, err.extras);
    }

    res.status(err.statusCode).json(response);
    return;
  }
  res.status(500).json({ status: 'error', message: 'Internal server error' });
};
