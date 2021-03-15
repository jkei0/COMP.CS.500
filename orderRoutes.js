const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { getAllOrders, getUserOrders, getOrderById, postOrder } = require('./controllers/orders');
const { getCurrentUser } = require('./auth/auth');

/**
 * Main handler for requests coming to /api/orders***
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} filePath URL address
 * @param {string} method HTTP method
 * @returns {http.ServerResponse} http response
 */
const handleOrdersRequest = (request, response, filePath, method) => {

  if (filePath === "/api/orders") {
    return handleAllOrdersRequest(request, response, method);
  }

  const orderId = filePath.replace("/api/orders/", "");
  return handleOrdersIdRequest(request, response, method, orderId);
};

/**
 * Handles requests to /api/orders
 * does user authentication and authorization
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @returns {http.ServerResponse} HTTP response
 */
const handleAllOrdersRequest = async (request, response, method) => {

  const allowedMethods = ["GET", "POST"];
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

  if (method === "GET") {
    if (user.role === "admin") {
      return getAllOrders(response);
    }
    return getUserOrders(response, user);
  }

  if (method === "POST") {
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // Specifically denying admins from making orders for some odd reason
    if (user.role !== "customer") {
      return responseUtils.forbidden(response);
    }

    const orderData = await parseBodyJson(request);
    return postOrder(response, user, orderData);
  }
};

/**
 * Handles requests to /api/orders/{orderId}
 * Does user authentication, orders controller determines authorization after querying
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @param {string} orderId ID for order
 * @returns {http.ServerResponse} HTTP response
 */
const handleOrdersIdRequest = async (request, response, method, orderId) => {

  if (method === "OPTIONS") {
    return responseUtils.sendOptions(response, ["GET"]);
  }

  if (method !== "GET") {
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

  if (method === "GET") {
    return getOrderById(response, orderId, user);
  }
};

module.exports = { handleOrdersRequest };
