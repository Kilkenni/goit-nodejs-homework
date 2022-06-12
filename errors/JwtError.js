const { ServerError} = require("./ServerError")

//Generic auth error from which all others are derived
//[details] is a single optional string that is transformed into array to conform to ServerError format
class NotAuthorizedError extends ServerError {
  constructor(details = "", statusCode = 401, statusMessage = "Not authorized") {
    super(details, statusCode, statusMessage);
    if (details && typeof details === "string") {
        this.details = [{
          message: details,
        }];
    }
  }
}

class NoAuthFoundError extends NotAuthorizedError {
  constructor(details = "No authorization header found", statusCode = 401, statusMessage = "Not authorized") {
    super(details, statusCode, statusMessage);
  }
}

class NoTokenError extends NotAuthorizedError {
  constructor(details = "Authorization header found but it lacks a token", statusCode = 401, statusMessage = "Not authorized") {
    super(details, statusCode, statusMessage);
  }
}

class InvalidAuthTypeError extends NotAuthorizedError {
  constructor(authType) {
    super();
    this.details = [{
      message: `Authorization type incorrect. Expected: ${authType}`,
    }];
  }
}

class InvalidTokenError extends NotAuthorizedError {
  constructor(details = `Token verification failed. Invalid or expired token?`, statusCode = 401, statusMessage = "Not authorized") {
    super(details, statusCode, statusMessage);
  }
}

module.exports = { NotAuthorizedError, NoAuthFoundError, NoTokenError, InvalidAuthTypeError, InvalidTokenError };