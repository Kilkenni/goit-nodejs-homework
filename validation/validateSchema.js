const { ReqValidationError } = require("../errors/ServerError");

/**
 * Express middleware that validates req.body against Joi schema
 * @param {!Joi} schema - Joi schema
 * @param {!ReqValidationError} ErrorClass - this error is thrown as HTTP error with code 400 on validation errors
 */
function validateSchema(schema, ErrorClass = ReqValidationError) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error !== undefined) {
      next(new ErrorClass(error.details, 400, "Invalid request data."));
      return;
    }

    next();
  } 
}

module.exports = validateSchema;