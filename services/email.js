const sendgridMail = require('@sendgrid/mail');
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const { ServerError } = require("../errors/ServerError")

/**
 * Sends a letter with a token to verify email address
 * @param {!string} email - recipient
 * @param {!string} verificationToken 
 * @returns {boolean} - true on success, error on failure
 */
async function sendVerificationEmail(email, verificationToken) {
  const fromEmail = process.env.SENDGRID_SENDER_EMAIL;

  const verifyURL = `/users/verify/${verificationToken}`;

  const letter = {
    to: email, // Change to your recipient
    from: fromEmail, // Change to your verified sender
    subject: 'Email verification token',
    text: `Use this link to verify your email: ${verifyURL}`,
    html: `<p>Use this link to verify your email: 
    <a href=${verifyURL}>${verifyURL}</a></p>`,
  }

  try {
    const response = await sendgridMail.send(letter);
    const sentStatus = response[0].statusCode;
    if (sentStatus >= 200 && sentStatus < 300) {
      return true; //success
    }
    else {
      throw new Error(`Sending failed, response code ${sentStatus}`); //generic, TODO: better error description?
    }
  }
  catch (error) {
    throw new ServerError("Verification mail error");
  }
}

module.exports = {
  sendVerificationEmail,
}