const { getCredentials } = require('../utils/requestUtils');
const User = require("../models/user");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request HTTP request
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.4 Implement getting current user based on the "Authorization" request header

  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user

  const credentials = getCredentials(request);

  if(credentials === null) {
    return null;
  }

  const user = await User.findOne({ email: credentials[0] }).exec();

  if(user === null) {
    return null;
  }
  else if(await user.checkPassword(credentials[1])) {
    return user;
  }
  // request have wrong password
  else {
    return null;
  }
};

module.exports = { getCurrentUser };
