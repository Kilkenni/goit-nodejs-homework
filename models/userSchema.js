const { Schema, model } = require("mongoose");
const Joi = require("joi");
const JoiJwt = Joi.extend((Joi) => ({
  base: Joi.array(),
  type: 'jwtArray',
  coerce: (value, helpers) => {
    return {
      value: value.split ? value.split('.') : value,
    }; //split input into array on "."
  },
}));
//const bcryptjs = require("bcryptjs");

const userSchema = Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  avatarURL: {
    type: String,
  },
  token: {
    type: String,
    default: null,
  },
}, { timestamps: true });
  
//We hash password in the userOps, no need for document-level middleware
/*
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.password = await bcryptjs.hash(this.password, 11);
  };
  //TODO: hash pasword again if it changes!
});
*/

const User = model("user", userSchema);

const userValRegistration = Joi.object({
  password: Joi.string().min(8, "utf8").max(55, "utf8").required(),
  email: Joi.string().email().required(),
  subscription: Joi.string().valid("starter", "pro", "business"),
});

const userValLogin = Joi.object({
  password: Joi.string().min(8, "utf8").max(55, "utf8").required(),
  email: Joi.string().email().required(),
});
//we still check password here as a failproof to avoid overloading bcrypt with hashing big fake "passwords"

const userValSubscription = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const userValSchema = Joi.object({
  password: Joi.string().min(8, "utf8").max(55, "utf8").required(),
  email: Joi.string().email().required(),
  subscription: Joi.string().valid("starter", "pro", "business"),
  token: JoiJwt.jwtArray().length(3).items(Joi.string().base64({
    paddingRequired: false,
    urlSafe: true,
  })),
});
//by this schema, token should be an "array" of base64URL strings previously separated by "."
//note the use of JoiJwt that coerces the token into this array

module.exports = { User, userValRegistration, userValLogin, userValSubscription, userValSchema};
