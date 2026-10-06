import { Router } from 'express';
import { appVersionController } from '../../modules/appVersion';
import { appVersionMiddleware } from '../../middlewares/appVersion.middlewate';

const router = Router();

router.get('/required',appVersionMiddleware, appVersionController.required);

export default router;
