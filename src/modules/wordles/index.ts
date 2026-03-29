import { Router } from 'express';
import * as wordlesController from './wordles.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { createWordlesSchema, updateWordlesSchema } from './wordles.validate';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(wordlesController.getAllWordless)
  .post(validate(createWordlesSchema), wordlesController.createWordles);

router
  .route('/:id')
  .get(wordlesController.getWordlesById)
  .patch(validate(updateWordlesSchema), wordlesController.updateWordles)
  .delete(wordlesController.deleteWordles);

export default router;
