const { Schema, model, ObjectId } = require("mongoose");
const Joi = require("joi");

const contactSchema = Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
    required: [true, "Contact email is required"],
  },
  phone: {
    type: String,
    required: [true, "Contact phone is required"],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: ObjectId,
    ref: 'user',
  },
}, {versionKey: false, timestamps: true});

const Contact = model("contact", contactSchema);

const contactValSchema = Joi.object({
  name: Joi.string().min(2).max(30).pattern(/^([^\[\#\@\]\{\}\(\)\:\;\=\?]+)$/, "name").required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
  owner: Joi.string().required(),
});

const contactValSchemaFav = Joi.object({
  favorite: Joi.boolean().required(),
});

module.exports = { Contact, contactValSchema, contactValSchemaFav };
