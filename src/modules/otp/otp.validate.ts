import Joi from 'joi';
import { email, password, userName } from '../auth/auth.validate';

export const sendOtpSchema = Joi.object({
  email,
  userName,
  password,
  displayName: Joi.string().max(50).optional(),
});

export const verifyOtpSchema = Joi.object({
  email,
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
  }),
  userName,
  password,
  displayName: Joi.string().max(50).optional(),
});

export const resendOtpSchema = Joi.object({ email });
