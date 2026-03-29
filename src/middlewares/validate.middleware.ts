import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: errors, // string[]  ✅
      });
      return;
    }
    next();
  };
};
