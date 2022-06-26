const { ServerError } = require("./ServerError");

class NoFileUploadedError extends ServerError {
  constructor(details = "No file found in request body", statusCode = 400, statusMessage = "Bad request") {
    super(details, statusCode, statusMessage);
    if (details && typeof details === "string") {
        this.details = [{
          message: details,
        }];
    }
  }
}
class InvalidFileError extends ServerError {
  constructor(details = "Invalid file in request", statusCode = 400, statusMessage = "Bad request") {
    super(details, statusCode, statusMessage);
    if (details && typeof details === "string") {
        this.details = [{
          message: details,
        }];
    }
  }
}

class InvalidFileTypeError extends InvalidFileError {
  /**
   * @param {String} details - provides a valid type for error hint
   */
  constructor(details, statusCode, statusMessage) {
    super(details, statusCode, statusMessage);
    if (details && typeof details === "string") {
        this.details = [{
          message: `Invalid file type. Valid types for this request: ${details}`,
        }];
    }
  }
}

module.exports = {
  NoFileUploadedError,
  InvalidFileError,
  InvalidFileTypeError,
}