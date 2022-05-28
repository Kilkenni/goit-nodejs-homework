class ContactsError extends Error {
  constructor(statusCode = 500, statusMessage = "Internal server error") {
    super();
    this.statusCode = statusCode;
    this.message = statusMessage;
  }
}

module.exports = ContactsError;