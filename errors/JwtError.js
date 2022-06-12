const { ServerError} = require("./ServerError")

class NotAuthorizedError extends ServerError {
  constructor(details = "") {
    super();
    this.statusCode = 401;
    this.message = "Not authorized";
    if (details) {
      this.details = [{
        message: details,
      }];
    }
  }
}

class NoAuthError extends NotAuthorizedError {
  constructor() {
    super();
    this.details = [{
      message: `No authorization header found`,
    }];
  }
}

class NoTokenError extends NotAuthorizedError {
  constructor() {
    super();
    this.details = [{
      message: `Authorization header found but there's no token in it`,
    }];
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
  constructor(details = [{ message: `Token verification failed. Invalid or expired token?`, }]) {
    
    super();
    this.details = details;
  }
}

module.exports = { NotAuthorizedError, NoAuthError, NoTokenError, InvalidAuthTypeError, InvalidTokenError };