const Joi = require("joi");

const signupValidation = (data) => {
  const signupSchema = Joi.object({
    name: Joi.string().trim().alphanum().min(3).max(10).required(),
    email: Joi.string()
      .trim()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
      .required(),
    password: Joi.string()
      .trim()
      .regex(/^[a-z0-9]{6,30}$/)
      .required(),
  });
  return signupSchema.validate(data);
};
const loginValidation = (data) => {
  const loginSchema = Joi.object({
    email: Joi.string()
      .trim()
      .email({
        minDomainSegments: 2,
        tlds: {
          allow: ["com", "net"],
        },
      })
      .required(),
    password: Joi.string().trim().required(),
  });
  return loginSchema.validate(data);
};

const addBookValidation = (data) => {
  const bookSchema = Joi.object({
    title: Joi.string().trim().min(3).max(10).required(),
    ISBN: Joi.string().trim().min(4).max(100).required(),
    stock: Joi.number().min(1).required(),
    author: Joi.string().trim().min(3).max(20).required(),
    description: Joi.string().trim().min(5).max(200).required(),
    category: Joi.string().trim().min(3).max(10).required(),
  });
  return bookSchema.validate(data);
};

module.exports.signupValidation = signupValidation;
module.exports.loginValidation = loginValidation;
module.exports.addBookValidation = addBookValidation;
