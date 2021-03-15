const responseUtils = require('./utils/responseUtils');
const { acceptsJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { handleProductsRequest } = require('./productRoutes');
const { handleUsersRequest, handleRegisterUserRequest } = require('./userRoutes');
const { handleOrdersRequest } = require('./orderRoutes');

/**
 * Serves files from the public folder
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} filePath URL address
 * @param {string} method HTTP method
 * @returns {object|http.ServerResponse} function to do rendering
 */
const handlePublicFileRequest = (response, filePath, method) => {
  if (method !== 'GET') {
    return responseUtils.methodNotAllowed(response);
  }
  const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
  return renderPublic(fileName, response);
};

/**
 * The main request handler, manages user authentication
 * and splits to subfunctions based on request filepath
 *
 * @param {http.ServerRequest} request HTTP request
 * @param {http.serverResponse} response HTTP response
 * @returns {object} helper function
 */
const handleRequest = (request, response) => {
  const method = request.method.toUpperCase();
  const filePath = new URL(request.url, `http://${request.headers.host}`).pathname;

  // serve static files from public/
  if (!filePath.startsWith('/api')) {
    return handlePublicFileRequest(response, filePath, method);
  }

  // The only API call non-registered users can use
  if (filePath === '/api/register') {
    return handleRegisterUserRequest(request, response, method);
  }

  // Splitting based on requested filepath
  if (filePath.startsWith("/api/products")) {
    return handleProductsRequest(request, response, filePath, method);
  }

  if (filePath.startsWith("/api/orders")) {
    return handleOrdersRequest(request, response, filePath, method);
  }

  if (filePath.startsWith("/api/users")) {
    return handleUsersRequest(request, response, filePath, method);
  }

  // Unknown url, sending 404 Not Found
  return responseUtils.notFound(response);
};

module.exports = { handleRequest };
