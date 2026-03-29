import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authController, authValidation } from '../../modules/auth';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(authValidation.registerSchema),
  authController.register,
);
router.post('/login', authLimiter, validate(authValidation.loginSchema), authController.login);
router.post(
  '/clerk',
  authLimiter,
  validate(authValidation.clerkAuthSchema),
  authController.clerkAuth,
);
router.post(
  '/forgot-password',
  authLimiter,
  validate(authValidation.forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  validate(authValidation.resetPasswordSchema),
  authController.resetPassword,
);
router.get('/me', authenticate, authController.getMe);

export default router;
