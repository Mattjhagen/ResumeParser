// validators.js
const Joi = require('joi');

const resumeSchema = Joi.object({
  resumeText: Joi.string().min(10).required()
});

const domainSchema = Joi.object({
  email: Joi.string().email().required(),
  type: Joi.string().required(),
  domain: Joi.string().uri().required()
});

function validateResume(req, res, next) {
  const { error } = resumeSchema.validate(req.body);
  if (error) return res.status(400).send(error.message);
  next();
}

function validateDomain(req, res, next) {
  const { error } = domainSchema.validate(req.body);
  if (error) return res.status(400).send(error.message);
  next();
}

module.exports = { validateResume, validateDomain };
