const express = require("express");
const gravatar = require("gravatar");

const multer = require("multer");

const usersRouter = express.Router();

const userOps = require('../../models/users');
const avatarOps = require("../../files/avatars.js");
const { ServerError, NotFoundError } = require("../../errors/ServerError.js");
const { NotAuthorizedError } = require("../../errors/JwtError");
const { NoFileUploadedError, InvalidFileError } = require("../../errors/FileError.js");

const {userValRegistration, userValVerification, userValLogin, userValSubscription } = require("../../models/userSchema.js");
const validateSchema = require("../../validation/validateSchema.js");
const { validateToken } = require("../../validation/validateJsonWebToken");

function filterUserEmailSub(userData) {
  const { email, subscription } = userData;
  return { email, subscription };
}

function getGravatar(email, size = "250", def = "retro") {
  return gravatar.url(email, { size, default: def}, true); //gets gravatar image URL or default pixel one generated from email hash if not found, force HTTPS
}

usersRouter.post('/signup', validateSchema(userValRegistration, ServerError), async (req, res, next) => {
  try {
    const { email, password, subscription } = req.body;
    const avatarURL = getGravatar(email);
    const registeredUser = await userOps.registerUser(email, password, subscription , avatarURL);

    res.status(201).json({
      user: filterUserEmailSub(registeredUser),
    })
  }
  catch (error) {
    next(error);
    return;
  }
});

usersRouter.post("/login", validateSchema(userValLogin, ServerError), async (req, res, next) => {
  try {
    const { email, password} = req.body;
    const loggedUser = await userOps.loginUser(email, password);

    res.status(200).json({
      token: loggedUser.token,
      user: filterUserEmailSub(loggedUser),
    })
  }
  catch (error) {
    next(error);
    return;
  }
});

usersRouter.post("/verify", validateSchema(userValVerification), async (req, res, next) => {
  try {
    const { email } = req.body;
    const foundUser = await userOps.sendVerification(email, true);

    if (!foundUser) {
      throw new NotFoundError(`No user with email=${email} found`, 404, "User not found");
    }

    res.status(200).json({
      "message": "Verification email sent"
    });
  }
  catch (error) {
    next(error);
    return;
  }
});

usersRouter.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    console.log(verificationToken);
    const verifiedUser = await userOps.verifyUserEmail(verificationToken);
    if (!verifiedUser) {
      throw new NotFoundError(`No user with verification token = ${verificationToken} found or email already verified`, 404, "User not found");
    }
    
    res.status(200).json({
      message: 'Verification successful',
    });
  }
  catch (error) {
    next(error);
    return;
  }

});

usersRouter.get("/logout", validateToken, async (req, res, next) => {
  try {
    const loggedOutUser = await userOps.logoutUser(req.user.id);
    if (!loggedOutUser) {
      throw new NotAuthorizedError(`No user with id = ${req.user.id}`);
    }
    
    res.status(204).json(); //send 204 - success (empty)
  }
  catch (error) {
    next(error);
    return;
  }
});

usersRouter.get("/current", validateToken, async (req, res, next) => {
  try {
    const currentUser = await userOps.getUserById(req.user.id);
    if (!currentUser) {
      throw new NotAuthorizedError(`No user with id = ${req.user.id}`);
    }
    
    res.status(200).json(filterUserEmailSub(currentUser));
  }
  catch (error) {
    next(error);
    return;
  }
});

//update subscription
usersRouter.patch("/", validateSchema(userValSubscription, ServerError), validateToken, async (req, res, next) => {
  try {
    const { subscription} = req.body;
    const updatedUser = await userOps.updateSubscription(req.user.id, subscription);
    if (!updatedUser) {
      throw new NotAuthorizedError(`No user with id = ${req.user.id}`);
    }

    res.status(200).json({
      user: filterUserEmailSub(updatedUser),
    })
  }
  catch (error) {
    next(error);
    return;
  }
});

usersRouter.patch("/avatars", validateToken, avatarOps.uploadAvatars.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new NoFileUploadedError(`No valid file found in request body, field 'avatar'.`);
    }
    let avatarURL = null;
    //console.log(req.file)
    /*
    if (!req.file) {
      avatarURL = getGravatar(req.user.email); //if no file present, generate gravatar
    }
    */
    
    avatarURL = await avatarOps.resizeAndMoveAvatar(req.file.filename);
    
    const updated = await userOps.updateAvatar(req.user.id, avatarURL);
    if (!updated) {
      throw new NotAuthorizedError(`No user with id = ${req.user.id}`);
    }
    
    res.status(200).json({
      avatarURL: avatarURL, //we do not take it from updated b/c it returns OLD avatarURL data in this userOp
    })
  }
  catch (error) {
    console.log(error)
    next(error);
    return;
  }
});

usersRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      next(new InvalidFileError(err.message));
    }
    // //if it is a multer error, transform into 400 Bad request
    next(new InvalidFileError("Invalid file for upload (generic)"));
  }
  next(err);
});

module.exports = usersRouter;