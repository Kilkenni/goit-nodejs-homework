const {Schema, model} = require("mongoose");

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
}, {versionKey: false, timestamps: true});

const Contact = model("contact", contactSchema);

module.exports = Contact;
