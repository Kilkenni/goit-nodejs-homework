const { ServerError } = require("./ServerError");

class DatabaseError extends ServerError {
  constructor() {
    super();
    this.statusCode = 500;
    this.message = "Server database error";
  }
}

class DuplicateKeyError extends DatabaseError {
  constructor(duplicateKeys) {
    super();
    this.statusCode = 409;
    this.keys = duplicateKeys;
    const keysString = duplicateKeys.join(", ");

    this.message = `This ${keysString} is in use`;
  }
}

class LoginError extends DatabaseError {
  constructor() {
    super();
    this.statusCode = 401;
    this.message = "Email or password is wrong";
  }
}

module.exports = {
  DatabaseError,
  DuplicateKeyError,
  LoginError,
};