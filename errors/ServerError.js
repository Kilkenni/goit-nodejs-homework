class ServerError extends Error {
  constructor(statusCode = 500, statusMessage = "Internal server error", details = null) {
    super();
    this.statusCode = statusCode;
    this.message = statusMessage;
    //for Joi validation details
    if (details !== null) {
      this.details = details;
    }
  }
}

module.exports = { ServerError };