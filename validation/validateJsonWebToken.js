const jwt = require("jsonwebtoken");
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

const { NotAuthorizedError, NoAuthFoundError, NoTokenError, InvalidAuthTypeError, InvalidTokenError, TokenMismatchError } = require("../errors/JwtError");

const userOps = require('../models/users');

const tokenSchema = JoiJwt.jwtArray().length(3).items(
  Joi.string().base64({
    paddingRequired: false,
    urlSafe: true,
  })
);

const validateToken = async (req, res, next) => {
 
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next(new NoAuthFoundError());
    return;
  }
  const [authType, authToken] = authHeader.split(" ");
  if ((authType !== "Bearer")) {
    next(new InvalidAuthTypeError("Bearer"));
    return;
  }
  if (!authToken) {
    next(new NoTokenError());
    return;
  }
  const { error } = tokenSchema.validate(authToken);
  if (error !== undefined) {
    next(new InvalidTokenError(error.details)); //generate error with Joi details attached
    return;
  }
  
  try {
    const tokenPayload = jwt.verify(authToken, process.env.JWT_KEY, { ignoreExpiration: true }); //ignore expiration time on tokens. Normally we don't want it. This is enabled only for this practice backend

    const foundUser = await userOps.getUserById(tokenPayload.id);
    if (!foundUser) {
      next(new NotAuthorizedError("User with corresponding id not found"));
      return;
    }
    if (foundUser.token !== authToken) {
      next(new TokenMismatchError());
      return;
    }

    req.user = tokenPayload;
    next();
  }
  catch (error) {
    next(new InvalidTokenError(error.details));
    return;
  } 
};

module.exports = { validateToken };