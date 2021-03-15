const responseUtils = require('../utils/responseUtils');
const User = require("../models/user");

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response HTTP response
 * @returns {http.ServerResponse} HTTP response
 */
const getAllUsers = async response => {
  // TODO: 10.1 Implement this
  return responseUtils.sendJson(response, await User.find().exec());
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} userId ID of the user to be deleted
 * @param {object} currentUser current user
 * @returns {http.ServerResponse} HTTP response
 */
const deleteUser = async (response, userId, currentUser) => {
  // TODO: 10.1 Implement this
  if(currentUser.role !== 'admin') {
    return responseUtils.forbidden(response);
  }

  if (userId === currentUser.id) {
    return responseUtils.badRequest(response, "Can't delete own data");
  }

  const targetUser = await User.findById(userId).exec();

  if (!targetUser) {
    return responseUtils.notFound(response);
  }

  const deletedUser = await targetUser.remove();
  return responseUtils.sendJson(response, deletedUser);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} userId user ID
 * @param {object} currentUser current user
 * @param {object} userData JSON data from request body
 * @returns {http.ServerResponse} HTTP response
 */
const updateUser = async (response, userId, currentUser, userData) => {
  // TODO: 10.1 Implement this

  if( userData.role !== 'admin' && userData.role !== 'customer') {
    return responseUtils.badRequest(response, 'User role not valid');
  }

  if (currentUser.role !== 'admin') {
    return responseUtils.forbidden(response);
  }

  if (userId === currentUser.id) {
    return responseUtils.badRequest(response, "Updating own data is not allowed");
  }

  const targetUser = await User.findById(userId).exec();

  if (!targetUser) {
    return responseUtils.notFound(response);
  }

  targetUser.role = userData.role;
  // Validation already done, should always succeed..?
  const savedUser = await targetUser.save();
  return responseUtils.sendJson(response, savedUser);
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} userId user ID
 * @param {object} currentUser current user
 * @returns {http.ServerResponse} HTTP response
 */
const viewUser = async (response, userId, currentUser) => {
  // TODO: 10.1 Implement this
  if(currentUser.role !== 'admin') {
    return responseUtils.forbidden(response);
  }

  const targetUser = await User.findById(userId).exec();

  if (!targetUser) {
    return responseUtils.notFound(response);
  }

  return responseUtils.sendJson(response, targetUser);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {object} userData JSON data from request body
 * @returns {http.ServerResponse} HTTP response
 */
const registerUser = async (response, userData) => {
  // TODO: 10.1 Implement this

  if (await User.findOne({ email: userData.email }).exec() !== null) {
    return responseUtils.badRequest(response, 'Email already in use');
  }

  const newUser = new User ({
    name:userData.name,
    email:userData.email,
    password:userData.password
  });

  await newUser.save()
    .then(savedUser => {
      responseUtils.createdResource(response, savedUser);
    })
    .catch(error => {
      responseUtils.badRequest(response, error.message);
    });
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };
