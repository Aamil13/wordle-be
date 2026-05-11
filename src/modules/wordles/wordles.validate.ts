import Joi from 'joi';

export const createWordlesSchema = Joi.object({
  // define validation rules here
});

export const updateWordlesSchema = Joi.object({
  // define validation rules here
}).min(1);
