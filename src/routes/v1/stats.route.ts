import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { statsController, statsValidation } from '../../modules/stats';

const router = Router();

router.post(
  '/update',
  authenticate,
  validate(statsValidation.updateStatsValidation),
  statsController.updateStats,
);
router.post(
  '/infinite/session',
  authenticate,
  validate(statsValidation.infiniteSessionValidation),
  statsController.updateInfiniteSession,
);
router.get(
  '/',
  authenticate,
  validate(statsValidation.userIdParamValidation),
  statsController.getAllStats,
);
router.get(
  '/:gameMode',
  authenticate,
  // validate(statsValidation.gameModeParamValidation),
  statsController.getStatsByMode,
);
router.delete(
  '/:gameMode',
  authenticate,
  validate(statsValidation.gameModeParamValidation),
  statsController.resetStats,
);
router.post(
  '/batch-update',
  authenticate,
  validate(statsValidation.batchUpdateValidation),
  statsController.batchUpdateStats,
);

// Public route (no auth required)
router.get('/user/:userId', statsController.getUserStats);

export default router;
