class ContactsError extends Error {
  constructor(statusCode = 500, statusMessage = "Internal server error", details = null) {
    super();
    this.statusCode = statusCode;
    this.message = statusMessage;
    if (details !== null) {
      this.details = details;
    }
  }
}

module.exports = ContactsError;