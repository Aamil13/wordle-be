import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './error.middleware';

export const validate = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.body) {
      return next(new AppError('Request body is missing', 400));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));

      return next(
        new AppError('Validation failed', 400, {
          details: errors,
        }),
      );
    }

    req.body = value;
    next();
  };
};
