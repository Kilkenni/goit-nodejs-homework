const express = require("express");

const usersRouter = express.Router();

const userOps = require('../../models/users');
const userControllers = require("./controllers/users");
const { ServerError } = require("../../errors/ServerError.js");
const { NotAuthorizedError } = require("../../errors/JwtError");

const {userValRegistration, userValLogin, userValSubscription } = require("../../models/userSchema.js");
const validateSchema = require("../../validation/validateSchema.js");
const { validateToken } = require("../../validation/validateJsonWebToken");

const filterUserEmailSub = require("./controllers/users/util");

usersRouter.post('/signup', validateSchema(userValRegistration, ServerError), async (req, res, next) => {
  try {
    const { email, password, subscription } = req.body;
    const registeredUser = await userOps.registerUser(email, password, subscription);

    res.status(201).json({
      user: filterUserEmailSub(registeredUser),
    })
  }
  catch (error) {
    next(error);
    return;
  }
});

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

module.exports = usersRouter;