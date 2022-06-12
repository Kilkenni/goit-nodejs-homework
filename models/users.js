const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("./userSchema.js");
const { DatabaseError, DuplicateKeyError, LoginError } = require("../errors/DbError");

async function hashPassword(plainTextPassword) {
  return await bcryptjs.hash(plainTextPassword, 11);
}

async function registerUser(email, password, subscription = "starter") {
  try {
    const userWithId = await User.create({
      email,
      password: await hashPassword(password),
      subscription,
    });

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

async function loginUser(email, password) {
  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      throw new LoginError(); //can't find by this email
    }
    if (!await bcryptjs.compare(password, foundUser.password)) {
      throw new LoginError(); //password is incorrect
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
    throw new DatabaseError;
  }
}

async function logoutUser(id) {
  try {
    const loggedOutUser = await User.findByIdAndUpdate(id, {token: null}, {new: true});
    
    return loggedOutUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError;
  }
}

async function getUserById(id){
  try {
    const currentUser = await User.findById(id);
    
    return currentUser;
  }
  catch (mongooseError) {
    if (mongooseError instanceof DatabaseError) {
      throw mongooseError; //we know this error, throw it further
    }
    throw new DatabaseError;
  }
}

async function updateSubscription(id, subscription){
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {subscription}, {new: true});
    
    return updatedUser;
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
  loginUser,
  logoutUser,
  getUserById,
  updateSubscription,
};