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

  req.query = value;
  next();
};

router.get('/', validateQuery, leaderboardController.getLeaderboard);

router.post('/snapshot', leaderboardController.snapshotLeaderboard);

export default router;
