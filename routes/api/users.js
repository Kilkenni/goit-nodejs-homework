const express = require("express");
const gravatar = require("gravatar");

const multer = require("multer");

const usersRouter = express.Router();

const userOps = require('../../models/users');
const userControllers = require("./controllers/users");
const avatarOps = require("../../files/avatars.js");
const { ServerError } = require("../../errors/ServerError.js");
const { NotAuthorizedError } = require("../../errors/JwtError");
const { NoFileUploadedError, InvalidFileError } = require("../../errors/FileError.js");

const {userValRegistration, userValLogin, userValSubscription } = require("../../models/userSchema.js");
const validateSchema = require("../../validation/validateSchema.js");
const { validateToken } = require("../../validation/validateJsonWebToken");

const filterUserEmailSub = require("./controllers/users/util");

function getGravatar(email, size = "250", def = "retro") {
  return gravatar.url(email, { size, default: def}, true); //gets gravatar image URL or default pixel one generated from email hash if not found, force HTTPS
}

usersRouter.post('/signup', validateSchema(userValRegistration, ServerError), userControllers.signup);

usersRouter.post("/login", validateSchema(userValLogin, ServerError), userControllers.login);

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