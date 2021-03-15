const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { getProduct, getAllProducts, addProduct, updateProduct, deleteProduct } = require('./controllers/products');
const { getCurrentUser } = require('./auth/auth');

/**
 * Splits requests coming to /api/products****
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} filePath URL address
 * @param {string} method HTTP method
 * @returns {object} handler function for different requests
 */
const handleProductsRequest = (request, response, filePath, method) => {

  if (filePath === "/api/products") {
    return handleAllProductsRequest(request, response, method);
  }

  const productId = filePath.replace('/api/products/', '');
  return handleProductsIdRequest(request, response, method, productId);
};

/**
 * Handles all requests coming to /api/products
 * Does user authentication and authorization
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @returns {http.ServerResponse} HTTP response
 */
const handleAllProductsRequest = async (request, response, method) => {

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
    return getAllProducts(response);
  }

  if (method === "POST") {
    // POST only allowed for admins
    if (user.role !== "admin") {
      return responseUtils.forbidden(response);
    }

    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    const productData = await parseBodyJson(request);
    return addProduct(response, productData);
  }
};

/**
 * Handles all requests coming to /api/products/{productId}
 * Does user authentication and authorization
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.ServerResponse} response HTTP response
 * @param {string} method HTTP method
 * @param {string} productId product ID
 * @returns {http.ServerResponse} HTTP response
 */
const handleProductsIdRequest = async (request, response, method, productId) => {

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

  if (method === "GET") {
    return getProduct(response, productId);
  }

  if (user.role !== "admin") {
    return responseUtils.forbidden(response);
  }

  if (method === "PUT") {
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    const productData = await parseBodyJson(request);
    return updateProduct(response, productId, productData);
  }

  if (method === "DELETE") {
    return deleteProduct(response, productId);
  }
};

module.exports = { handleProductsRequest };
