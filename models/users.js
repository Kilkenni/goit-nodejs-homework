const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// const sendgridMail = require('@sendgrid/mail');
// sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const { User } = require("./userSchema.js");
const { removeAvatar: removeOldAvatar} = require("../files/avatars");
const { DatabaseError, DuplicateKeyError, LoginError, NotVerifiedUserError, VerifiedUserError } = require("../errors/DbError");
const { ServerError } = require("../errors/ServerError");

const emailOps = require("../services/email");

async function hashPassword(plainTextPassword) {
  return await bcryptjs.hash(plainTextPassword, 11);
}

/**
 * 
 * @param {!String} email 
 * @param {!String} password 
 * @param {("starter"|"pro"|"business")} [subscription=starter] 
 * @param {!String} avatarURL - path to avatar image
 * @returns {!Object} User data with ID
 */

async function registerUser(email, password, subscription = "starter", avatarURL) {
  try {
    const verificationToken = uuidv4();
    const userWithId = await User.create({
      email,
      password: await hashPassword(password),
      subscription,
      avatarURL,
      verificationToken,
      verify: false, //not verified email by default
    });

    await emailOps.sendVerificationEmail(email, verificationToken);

    return userWithId; //return new contact with id 
  }
  catch (mongooseError) {
    if (mongooseError.code === 11000) {
      throw new DuplicateKeyError(Object.keys(mongooseError.keyValue));
    }
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }

    throw new DatabaseError();
  }
}

/**
 * Resends email verification token to target email
 * @param {!string} email - target email
 * @returns 
 */
async function sendVerification(email) {
  try {
    
    const nonverifiedUser = await User.findOne({ email: email }).select(["email", "verificationToken", "verify"]);
    
    if (!nonverifiedUser) {
      return nonverifiedUser; //no user with this email
    }
    if (nonverifiedUser.verify === true) {
      throw new VerifiedUserError(); //already verified
    }
    
    const { verificationToken } = nonverifiedUser;

    const sent = await emailOps.sendVerificationEmail(email, verificationToken);
    if (sent) {
      return nonverifiedUser;
    }
    else {
      return false;
    }
  }
  catch (error) {
    if (error instanceof DatabaseError || error instanceof ServerError) {
      throw error; //we know this error, throw it further
    }
    throw new DatabaseError();
  }
}

/**
 * Marks user as "email verified". Finishes successfully only once for a single token
 * @param {!string} verificationToken
 */
async function verifyUserEmail(verificationToken) {
  try {
    const verifiedUser = await User.findOneAndUpdate({ verificationToken: verificationToken }, {
      verificationToken: null,
      verify: true,
    }, { new: true });

    return verifiedUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError();
  }
}

async function loginUser(email, password) {
  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      throw new LoginError("email"); //can't find by this email
    }
    if (!foundUser.verify) {
      throw new NotVerifiedUserError();
    }
    if (!await bcryptjs.compare(password, foundUser.password)) {
      throw new LoginError("password"); //password is incorrect
    };

    const tokenPayload = {
      id: foundUser._id,
      email: foundUser.email,
      subscription: foundUser.subscription,
    }
    const token = jwt.sign(tokenPayload, process.env.JWT_KEY, {
      expiresIn: "3h",
    });
    const foundUserWithToken = await User.findByIdAndUpdate(foundUser._id, { token }, {new: true});

    return foundUserWithToken;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError();
  }
}

async function logoutUser(id) {
  try {
    const loggedOutUser = await User.findByIdAndUpdate(id, {token: null}, {new: true}).select(["email", "subscription", "token"]);
    
    return loggedOutUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError();
  }
}

async function getUserById(id){
  try {
    const currentUser = await User.findById(id).select(["email", "subscription", "token"]);
    
    return currentUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError();
  }
}

async function updateSubscription(id, subscription){
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {subscription}, {new: true}).select(["email", "subscription"]);
    
    return updatedUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError;
  }
}

/**
 * Updates URL path to avatar for a single user
 * @param {!String} id - User ID
 * @param {!String} avatarURL - relative to server's public dir
 * @returns {Object} - user data with OLD avatarURL
 */
async function updateAvatar(id, avatarURL) {
  try {
    const prevUser = await User.findByIdAndUpdate(id, {avatarURL}, {new: false}).select(["email", "avatarURL"]);
    //console.log("Prev avatar is:" + prevUser.avatarURL)

    await removeOldAvatar(prevUser.avatarURL); //cleanup previous avatar file
    return prevUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError;
  }
}

module.exports = {
  registerUser,
  verifyUserEmail,
  sendVerification,
  loginUser,
  logoutUser,
  getUserById,
  updateSubscription,
  updateAvatar,
};