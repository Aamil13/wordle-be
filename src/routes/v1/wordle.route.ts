import express from 'express';
import { wordlesController, wordlesValidation } from '../../modules/wordles';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = express.Router();

/**
 * Public Routes
 */
router.get('/', wordlesController.getAllWords);

router.get('/random', wordlesController.getRandomWord);

router.get(
  '/difficulty/:difficulty',
  validate(wordlesValidation.difficultyValidation),
  wordlesController.getWordsByDifficulty,
);

router.get(
  '/category/:category',
  validate(wordlesValidation.categoryValidation),
  wordlesController.getWordsByCategory,
);

router.get('/:id', validate(wordlesValidation.mongoIdValidation), wordlesController.getWordById);

/**
 * Protected Routes
 */
router.post(
  '/',
  authenticate,
  validate(wordlesValidation.createWordValidation),
  wordlesController.createWord,
);

router.patch(
  '/:id',
  authenticate,
  validate(wordlesValidation.mongoIdValidation),
  validate(wordlesValidation.updateWordValidation),
  wordlesController.updateWord,
);

router.patch(
  '/toggle/:id',
  authenticate,
  validate(wordlesValidation.mongoIdValidation),
  wordlesController.toggleWordStatus,
);

router.patch(
  '/played/:id',
  authenticate,
  // validate(wordlesValidation.mongoIdValidation),
  wordlesController.incrementPlayed,
);

router.patch(
  '/stats/:id',
  authenticate,
  validate(wordlesValidation.mongoIdValidation),
  validate(wordlesValidation.updateStatsValidation),
  wordlesController.updateStats,
);

router.delete(
  '/:id',
  authenticate,
  validate(wordlesValidation.mongoIdValidation),
  wordlesController.deleteWord,
);

export default router;
