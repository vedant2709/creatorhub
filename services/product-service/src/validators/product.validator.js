import Joi from "joi";

export const createProductSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),

  description: Joi.string().min(10).required(),

  price: Joi.number().min(0).required(),

  thumbnail: Joi.string().uri().optional(),

  tags: Joi.string().optional()
});