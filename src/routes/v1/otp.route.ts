import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { otpController, otpValidation } from '../../modules/otp';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/send-otp', authLimiter, validate(otpValidation.sendOtpSchema), otpController.sendOtp);
router.post(
  '/verify-otp',
  authLimiter,
  validate(otpValidation.verifyOtpSchema),
  otpController.verifyOtpAndRegister,
);
router.post(
  '/resend-otp',
  authLimiter,
  validate(otpValidation.resendOtpSchema),
  otpController.resendOtp,
);

export default router;
