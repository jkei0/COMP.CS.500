const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { getAllUsers, registerUser, deleteUser, viewUser, updateUser } = require('./controllers/users');
const { getCurrentUser } = require('./auth/auth');

/*
 * If anything about test ordering seems dumb and like a lot of copy-pasting,
 * it's because the automated tests REQUIRED them to be this way
 * Like sculpting a perfect cylinder only to hack it down to pieces to fit a square hole
 */

/**
 * Handles requests to /api/register
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @returns {http.ServerResponse} HTTP response
 */
const handleRegisterUserRequest = async (request, response, method) => {

  if (method === "OPTIONS") {
    return responseUtils.sendOptions(response, ["POST"]);
  }

  if (method !== "POST") {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct header for API calls ('application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (!isJson(request)) {
    return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
  }

  const userData = await parseBodyJson(request);
  return registerUser(response, userData);
};

/**
 * Splits requests based on filePath
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} filePath URl path
 * @param {string} method HTTP method
 * @returns {http.ServerResponse} HTTP response
 */
const handleUsersRequest = (request, response, filePath, method) => {

  if (filePath === "/api/users") {
    return handleAllUsersRequest(request, response, method);
  }

  const userId = filePath.replace("/api/users/", "");
  return handleUsersIdRequest(request, response, method, userId);
};

/**
 * Handles requests coming to /api/users
 * Does user authentication and authorization
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @returns {http.ServerResponse} HTTP response
 */
const handleAllUsersRequest = async (request, response, method) => {

  const allowedMethods = ["GET"];
  if (method === "OPTIONS") {
    return responseUtils.sendOptions(response, allowedMethods);
  }

  if (!allowedMethods.includes(method)) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct header for API calls ('application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // User authentication
  const user = await getCurrentUser(request);
  if (!user) {
    return responseUtils.basicAuthChallenge(response);
  }


  if (user.role !== "admin") {
    return responseUtils.forbidden(response);
  }

  if (method === "GET") {
    return getAllUsers(response);
  }
};

/**
 * Handles requests to /api/users/{userId}
 * Does user authentication and authorization
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @param {string} userId event target
 * @returns {http.ServerResponse} HTTP response
 */
const handleUsersIdRequest = async (request, response, method, userId) => {

  const allowedMethods = ["GET", "PUT", "DELETE"];
  if (method === "OPTIONS") {
    return responseUtils.sendOptions(response, allowedMethods);
  }

  if (!allowedMethods.includes(method)) {
    return responseUtils.methodNotAllowed(response);
  }

  // User authentication
  const user = await getCurrentUser(request);
  if (!user) {
    return responseUtils.basicAuthChallenge(response);
  }

  // Require a correct header for API calls ('application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  if (user.role !== "admin") {
    return responseUtils.forbidden(response);
  }

  if (method === "GET") {
    return viewUser(response, userId, user);
  }

  if (method === "PUT") {
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    const userData = await parseBodyJson(request);
    return updateUser(response, userId, user, userData);
  }

  if (method === "DELETE") {
    return deleteUser(response, userId, user);
  }
};

module.exports = { handleUsersRequest, handleRegisterUserRequest };
