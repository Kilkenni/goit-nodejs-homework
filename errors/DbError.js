const { ServerError } = require("./ServerError");

class DatabaseError extends ServerError {
  constructor(details = null, statusCode = 500, statusMessage = "Server database error") {
    super(details, statusCode, statusMessage);
  }
}

class DuplicateKeyError extends DatabaseError {
  constructor(duplicateKeys = [], statusCode = 409, statusMessage = "Some entries should be unique") {
    super(null, statusCode);
    this.keys = duplicateKeys;
    const keysString = duplicateKeys.join(", ");
    this.message = `This ${keysString} is in use`;
  }
}

class LoginError extends DatabaseError {
  constructor(wrongCredential = "", statusCode = 401, statusMessage = "Email or password is wrong") {
    super(null, statusCode, statusMessage);
    if (wrongCredential) {
      let detailedMessage = null;

      switch (wrongCredential) {
        case "email":
          detailedMessage = `Email not found in the DB`;
          break;
        case "password":
          detailedMessage = "Invalid password";
          break;
      }

      if (detailedMessage) {
        this.details = [
          {
            message: `${wrongCredential}`
          }
        ];
      }
    }    
  }
}

module.exports = {
  DatabaseError,
  DuplicateKeyError,
  LoginError,
};