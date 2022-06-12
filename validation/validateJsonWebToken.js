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

const { NoAuthFoundError, NoTokenError, InvalidAuthTypeError, InvalidTokenError } = require("../errors/JwtError");

const tokenSchema = JoiJwt.jwtArray().length(3).items(
  Joi.string().base64({
    paddingRequired: false,
    urlSafe: true,
  })
);

const validateToken = (req, res, next) => {
 
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
    const tokenPayload = jwt.verify(authToken, process.env.JWT_KEY, { maxAge: "7d" }); //consider tokens older than a week invalid!

    req.user = tokenPayload;
    next();
  }
  catch (error) {
    next(new InvalidTokenError());
    return;
  } 
};

module.exports = { validateToken };