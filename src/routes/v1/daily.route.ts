import express from 'express';
import { dailyController, dailyValidation } from '../../modules/daily';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = express.Router();

/**
 * GET /daily
 * Returns today's daily word.
 * Auth is optional — authenticated users also receive their `alreadyPlayed` status.
 */
router.get('/', dailyController.getDailyWord);

/**
 * POST /daily/played
 * Marks today's daily word as played for the authenticated user.
 * Returns 409 if the user has already played today.
 */
router.post('/played', authenticate, dailyController.markDailyPlayed);

/**
 * POST /daily/create
 * Creates a daily word for a specific date using a provided word ID.
 * Request body: { wordId: string, date: string }
 */
router.post(
  '/create',
  validate(dailyValidation.createDailyWordValidation),
  dailyController.createDailyWord,
);

/**
 * POST /daily/reset
 * Manually resets dailyPlayedToday to false for ALL users.
 * Request body: { key: string }
 */
router.post('/reset', dailyController.resetDailyPlayed);

export default router;
