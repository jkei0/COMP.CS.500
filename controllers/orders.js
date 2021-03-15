const responseUtils = require('../utils/responseUtils');
const Order = require("../models/order");


/**
 * Get all orders for admin users
 *
 * @param {http.ServerResponse} response HTTP response
 * @returns {http.ServerResponse}: HTTP response
 */
const getAllOrders = async response => {
  return responseUtils.sendJson(response, await Order.find().exec());
};

/**
 * Get user orders
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {object} user User schema document
 * @returns {http.ServerResponse} HTTP response
 */
const getUserOrders = async (response, user) => {
    return responseUtils.sendJson(response, await Order.find({ customerId: user.id }).exec());
};

/**
 * Get order by Id
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} id order id field from Order document
 * @param {object} currentUser current user object
 * @returns {http.ServerResponse} HTTP response
 */
const getOrderById = async (response, id, currentUser) => {

  const order = await Order.findById(id).exec();

  if (order === null) {
    return responseUtils.notFound(response);
  }
  else if (currentUser.role === 'customer' && currentUser.id !== order.customerId) {
    return responseUtils.notFound(response);
  }
  else {
    return responseUtils.sendJson(response, order);
  }

};

/**
 * save order to database
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} user user id field from Order document
 * @param {object} products products in JSON format
 * @returns {http.ServerResponse} HTTP response
 */
const postOrder = async (response, user, products) => {

  if (products.items.length === 0) {
    return responseUtils.badRequest(response, "No items in order");
  }

  const order = new Order ({
    customerId: user.id,
    products: products.items
  });

  await order.save()
    .then(savedOrder => {
      return responseUtils.createdResource(response, savedOrder);
    })
    .catch(error => {
      return responseUtils.badRequest(response, error.message);
    });

};



module.exports = { getAllOrders, getUserOrders, getOrderById, postOrder };
