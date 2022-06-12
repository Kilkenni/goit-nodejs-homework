const { ReqValidationError } = require("../errors/ServerError");

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