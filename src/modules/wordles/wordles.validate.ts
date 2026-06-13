import Joi from 'joi';

/**
 * Create word validation
 */
export const createWordValidation = Joi.object({
  word: Joi.string().trim().lowercase().min(3).max(10).required().messages({
    'string.base': 'Word must be a string',
    'string.empty': 'Word is required',
    'string.min': 'Word must be at least 3 characters',
    'string.max': 'Word cannot exceed 10 characters',
  }),

  hint: Joi.string().trim().required().messages({
    'string.empty': 'Hint is required',
  }),

  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional().messages({
    'any.only': 'Difficulty must be easy, medium or hard',
  }),

  category: Joi.string().trim().optional(),

  timesPlayed: Joi.number().min(0).optional(),

  successRate: Joi.number().min(0).max(100).optional(),

  averageAttempts: Joi.number().min(0).optional(),

  isActive: Joi.boolean().optional(),
});

/**
 * Update word validation
 */
export const updateWordValidation = Joi.object({
  word: Joi.string().trim().lowercase().min(3).max(10),

  hint: Joi.string().trim(),

  difficulty: Joi.string().valid('easy', 'medium', 'hard'),

  category: Joi.string().trim(),

  timesPlayed: Joi.number().min(0),

  successRate: Joi.number().min(0).max(100),

  averageAttempts: Joi.number().min(0),

  isActive: Joi.boolean(),
});

/**
 * Mongo id validation
 */
export const mongoIdValidation = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid MongoDB id',
    'string.length': 'Invalid MongoDB id length',
  }),
});

/**
 * Difficulty param validation
 */
export const difficultyValidation = Joi.object({
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required().messages({
    'any.only': 'Difficulty must be easy, medium or hard',
  }),
});

/**
 * Category param validation
 */
export const categoryValidation = Joi.object({
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
  }),
});
