const userOps = require('../../../../models/users');
const filterUserEmailSub = require("./util");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const loggedUser = await userOps.loginUser(email, password);

    return res.status(200).json({
      token: loggedUser.token,
      user: filterUserEmailSub(loggedUser),
    })
  }
  catch (error) {
    next(error);
    return;
  }
}

module.exports = login;