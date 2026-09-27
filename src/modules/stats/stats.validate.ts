import Joi from 'joi';
import { GameMode } from '../auth/auth.interface';

export const updateStatsValidation = Joi.object({
  gameMode: Joi.string()
    .valid(...Object.values(GameMode))
    .required()
    .messages({
      'any.only': 'Invalid game mode',
      'any.required': 'Game mode is required',
    }),

  result: Joi.object({
    won: Joi.boolean().required().messages({
      'any.required': 'Result must include won field',
    }),

    guesses: Joi.number()
      .min(1)
      .max(6)
      .when('won', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        'number.min': 'Guesses must be between 1 and 6',
        'number.max': 'Guesses must be between 1 and 6',
      }),

    timeSeconds: Joi.number().positive().optional(),
  }).required(),
});

export const infiniteSessionValidation = Joi.object({
  correctGuesses: Joi.number().positive().required().messages({
    'number.base': 'correctGuesses length must be a number',
    'number.positive': 'correctGuesses length must be greater than 0',
  }),
});

export const gameModeParamValidation = Joi.object({
  gameMode: Joi.string()
    .valid(...Object.values(GameMode))
    .required()
    .messages({
      'any.only': 'Invalid game mode',
    }),
});

export const userIdParamValidation = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'User ID required',
  }),
});

export const batchUpdateValidation = Joi.object({
  games: Joi.array()
    .items(
      Joi.object({
        gameMode: Joi.string()
          .valid(...Object.values(GameMode))
          .required(),

        result: Joi.object({
          won: Joi.boolean().required(),

          guesses: Joi.number().min(1).max(6).optional(),

          timeSeconds: Joi.number().positive().optional(),
        }).required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one game is required',
    }),
});
