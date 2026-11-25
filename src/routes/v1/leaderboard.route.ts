import { Router, Request, Response, NextFunction } from 'express';
import { leaderboardController, leaderboardValidation } from '../../modules/leaderboard';
import { AppError } from '../../middlewares/error.middleware';

const router = Router();

/** Inline query validator — the shared validate middleware only handles req.body */
const validateQuery = (req: Request, _res: Response, next: NextFunction): void => {
  const { error, value } = leaderboardValidation.getLeaderboardValidation.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => d.message.replace(/['"]/g, ''));
    return next(new AppError('Validation failed', 400, { details }));
  }

  // Express 5 defines req.query as a read-only getter, so mutate its keys instead of reassigning
  Object.keys(req.query).forEach((key) => delete req.query[key]);
  Object.assign(req.query, value);

  next();
};

router.get('/', validateQuery, leaderboardController.getLeaderboard);

router.post('/snapshot', leaderboardController.snapshotLeaderboard);

export default router;
