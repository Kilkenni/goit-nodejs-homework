/*
Custom errors are derived from ServerError

Format:
- [details]: an optional array of details for logs, should not be presented to end user unless they are Joi validation errors (code 400)
  [
    {
      message: 1st detailed message about the error
    },
    ...
  ]
- [statusCode]: HTTP-compatible 3-digit code
- [message]: "Safe" message that can be presented to end user
*/

class ServerError extends Error {
  constructor(details = null, statusCode = 500, statusMessage = "Internal server error") {
    super();
    this.statusCode = statusCode;
    this.message = statusMessage;
    //for Joi validation details and server logs
    if (details !== null) {
      if (typeof details === "string") {
        this.details = [
          {
            message: details,
          }
        ];
      }
      else {
        this.details = details;
      }
    }
  }
}

//details is a string
class NotFoundError extends ServerError {
  constructor(details = "", statusCode = 404, statusMessage = "Not found") {
    super(null, statusCode, statusMessage);
    if (details) {
      this.details = [
        {
          message: details,
        }
      ];
    }
  }
}

class ReqValidationError extends ServerError {
  constructor(details = null, statusCode = 400, statusMessage = "Bad request") {
    super(details, statusCode, statusMessage);
  }
}

module.exports = { ServerError, NotFoundError, ReqValidationError };