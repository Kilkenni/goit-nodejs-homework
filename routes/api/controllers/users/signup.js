const userOps = require('../../../../models/users');
const filterUserEmailSub = require("./util");

async function signup(req, res, next) {
  try {
    const { email, password, subscription } = req.body;
    const registeredUser = await userOps.registerUser(email, password, subscription);

    return res.status(201).json({
      user: filterUserEmailSub(registeredUser),
    })
  }
  catch (error) {
    next(error);
    return;
  }
}

module.exports = signup;