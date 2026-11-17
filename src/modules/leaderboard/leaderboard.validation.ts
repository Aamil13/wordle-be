import Joi from 'joi';
import { LeaderboardMode } from './leaderboard.interface';

export const getLeaderboardValidation = Joi.object({
  mode: Joi.string()
    .valid(...Object.values(LeaderboardMode))
    .required()
    .messages({
      'any.only': `mode must be one of: ${Object.values(LeaderboardMode).join(', ')}`,
      'any.required': 'mode is required',
    }),

  limit: Joi.number().integer().min(1).max(100).default(50),

  // Optional: YYYY-MM-DD to fetch a past day from MongoDB
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'date must be in YYYY-MM-DD format',
    }),
});
