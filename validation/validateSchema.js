function validateSchema(schema, ErrorClass) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error !== undefined) {
      next(new ErrorClass(400, "Invalid request data.", error.details));
      return;
    }

    next();
  } 
}

module.exports = validateSchema;