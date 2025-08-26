import Joi from 'joi';

const ideaSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().min(2).max(50).required(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  price: Joi.number().min(0).max(1000000).required(),
  image_url: Joi.string().uri().optional().allow('')
});

const updateIdeaSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(1000),
  category: Joi.string().min(2).max(50),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  price: Joi.number().min(0).max(1000000),
  image_url: Joi.string().uri().allow('')
});

export const validateIdea = (req, res, next) => {
  const { error } = ideaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateUpdateIdea = (req, res, next) => {
  const { error } = updateIdeaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};