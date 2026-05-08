import Joi from 'joi';

export const userName = Joi.string().alphanum().min(3).max(20).lowercase().required().messages({
  'string.alphanum': 'Username can only contain letters and numbers',
  'string.min': 'Username must be at least 3 characters',
  'string.max': 'Username cannot exceed 20 characters',
});

export const email = Joi.string().email().required().messages({
  'string.email': 'Please provide a valid email address',
});

export const password = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase and a number',
  });

export const registerSchema = Joi.object({
  userName,
  email,
  password,
  displayName: Joi.string().max(50).optional(),
});

export const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

export const clerkAuthSchema = Joi.object({
  clerkId: Joi.string().required(),
  email: Joi.string().email().required(),
  userName: Joi.string().min(3).max(20).required(),
  displayName: Joi.string().max(50).optional(),
  avatar: Joi.string().uri().optional(),
});

export const forgotPasswordSchema = Joi.object({ email });

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: password,
  confirmPassword: Joi.any()
    .equal(Joi.ref('newPassword'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});
