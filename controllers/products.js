const responseUtils = require('../utils/responseUtils');
const Product = require('../models/product');

// const { getAllProducts : getProducts } = require('../utils/products');

/**
 * Send all products as JSON
 *
 * will always send all products array in response
 *
 * @param {http.ServerResponse} response HTTP response
 * @returns {http.ServerResponse} HTTP response
 */
const getAllProducts = async (response) => {
  const products = await Product.find({}).exec();
  return responseUtils.sendJson(response, products);
};

/**
 * Returns a single product with the given ID
 *
 * on wrong product id, sends notFound response
 * on success, sends the found product in response
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} productId product id
 * @returns {http.ServerResponse} HTTP response
 */
const getProduct = async (response, productId) => {
  const foundProduct = await Product.findById(productId).exec();

  if (!foundProduct) {
    return responseUtils.notFound(response);
  } else {
    return responseUtils.sendJson(response, foundProduct);
  }
};

/**
 * Attempts to add a new Product into mongodb
 * name: String (required)
 * price: Number (required)
 * image: String
 * description: String
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {object} productData product data
 * @returns {http.ServerResponse} HTTP response
 */
const addProduct = async (response, productData) => {
  const newProduct = new Product ({
    name: productData.name,
    price: productData.price,
    image: productData.image,
    description: productData.description
  });

  await newProduct.save()
    .then(savedProduct => {
      responseUtils.createdResource(response, savedProduct);
    })
    .catch(error => {
      responseUtils.badRequest(response, error.message);
    });
};

/**
 * Runs validation to check values are acceptable before updating the product
 *
 * on wrong product id, sends notFound response
 * on validation failure, sends badRequest response
 * on success, sends updated product in response
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} productId Id for product
 * @param {object} productData Product object
 */
 const updateProduct = async (response, productId, productData) => {

   const targetProduct = await Product.findById(productId).exec();
   if (!targetProduct) {
     return responseUtils.notFound(response);
   }

   if (productData.name !== undefined) {
     if (productData === "") {
       return responseUtils.badRequest(response, "Validation error: Must have a name.");
     }
     targetProduct.name = productData.name;
   }

   if (productData.price !== undefined) {
     if (productData.price <= 0) {
       return responseUtils.badRequest(response, "Validation error: Price must be above zero.");
     }
     targetProduct.price = productData.price;
   }

   if (productData.image !== undefined) {
     targetProduct.image = productData.image;
   }

   if (productData.description !== undefined) {
     targetProduct.description = productData.description;
   }

   await targetProduct.save()
     .then(updatedProduct => {
       return responseUtils.sendJson(response, updatedProduct);
     })
     .catch(error => {
       return responseUtils.badRequest(response, error.message);
     });
 };


/**
 * Attempts to delete a product from the database
 *
 * on wrong product id, sends notFound response
 * on database error, sends badRequest (does this ever happen?)
 * on success, sends the deleted object data in response
 *
 * @param {http.ServerResponse} response HTTP response
 * @param {string} productId Product id
 */
const deleteProduct = async (response, productId) => {
  const targetProduct = await Product.findById(productId).exec();

  if (!targetProduct) {
    return responseUtils.notFound(response);
  }

  await Product.deleteOne({_id: productId})
    .then(() => {
      responseUtils.sendJson(response, targetProduct);
    })
    .catch(error => {
      responseUtils.badRequest(response, error.message);
    });
};

module.exports = { getAllProducts, getProduct, addProduct, updateProduct, deleteProduct };
