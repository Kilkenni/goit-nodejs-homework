const Joi = require("joi");

const contactFavSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

module.exports = contactFavSchema;