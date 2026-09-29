import Joi from 'joi';

/**
 * Validate date query param (optional) — format YYYY-MM-DD
 * Could be used for admin endpoints to fetch a specific day's word.
 */
export const dateParamValidation = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
    }),
});

/**
 * Validate create daily word request body
 */
export const createDailyWordValidation = Joi.object({
  wordId: Joi.string().required().messages({
    'string.empty': 'wordId is required',
    'any.required': 'wordId is required',
  }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.empty': 'date is required',
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'date is required',
  }),
});
