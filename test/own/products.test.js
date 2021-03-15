const chai = require('chai');
const expect = chai.expect;
const { createResponse } = require('node-mocks-http');
const { getAllProducts, getProduct, addProduct, updateProduct, deleteProduct } = require('../../controllers/products');
const Product = require('../../models/product');

// Get products (create copies for test isolation)
const originalProducts = require('../../setup/products.json').map(product => ({ ...product }));

describe('Products Controller', () => {
  let products;

  beforeEach(async () => {
    // reset database
    await Product.deleteMany({});
    await Product.create(originalProducts);
    const foundProducts = await Product.find({});
    products = foundProducts.map(product => JSON.parse(JSON.stringify(product)));
  });

  describe('getAllProducts()', () => {

    it('should respond with JSON', async () => {
      const response = createResponse();
      await getAllProducts(response);

      expect(response.statusCode).to.equal(200);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
      expect(response._getJSONData()).to.be.an('array');
      expect(response._getJSONData()).to.be.deep.equal(products);
    });
  });

  describe('getProduct()', () => {

    it('should return the correct product', async () => {
      const correctProduct = await Product.findOne({name: "Small Cotton Chicken"}).exec();
      const productId = correctProduct._id;
      
      const response = createResponse();
      await getProduct(response, productId);

      expect(response.statusCode).to.equal(200);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
      expect(response._getJSONData()).to.be.an('object');

      const returnedData = response._getJSONData();
      expect(returnedData.name).to.equal(correctProduct.name);
      expect(returnedData.price).to.equal(correctProduct.price);
      expect(returnedData.image).to.equal(correctProduct.image);
      expect(returnedData.description).to.equal(correctProduct.description);
    });

    it('should respond with 404 Not Found on wrong ID', async () => {
      const faultyId = "000000000000000000000000";
      const response = createResponse();
      await getProduct(response, faultyId);

      expect(response.statusCode).to.equal(404);
      expect(response._isEndCalled()).to.be.true;
    });
  });

  describe('addProduct()', () => {

    const dummyProduct = {
      name: "Testing manual",
      price: 199.99,
      image: "hello_world.png",
      description: "1001 bug-hunting tricks"
    };

    it('should add a new product into the database', async () => {
      let response = createResponse();
      await addProduct(response, dummyProduct);

      expect(response.statusCode).to.equal(201);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
      expect(response._getJSONData()).to.be.an('object');
      const productId = response._getJSONData()._id;

      response = createResponse();
      await getAllProducts(response);
      const allProducts = response._getJSONData();
      expect(allProducts.length).to.be.equal(originalProducts.length + 1);

      response = createResponse();
      await getProduct(response, productId);
      const savedProduct = response._getJSONData();
      expect(savedProduct.name).to.equal(dummyProduct.name);
      expect(savedProduct.price).to.equal(dummyProduct.price);
      expect(savedProduct.image).to.equal(dummyProduct.image);
      expect(savedProduct.description).to.equal(dummyProduct.description);
    });

    it('should require name and price values', async () => {
      const lackingName = {
      price: 199.99,
      image: "hello_world.png",
      description: "1001 bug-hunting tricks"
      };

      const lackingPrice = {
        name: "Testing manual",
        image: "hello_world.png",
        description: "1001 bug-hunting tricks"
      };

      let response = createResponse();
      await addProduct(response, lackingName);
      expect(response.statusCode).to.equal(400);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
      expect(response._getJSONData()).to.be.an('Object');

      response = createResponse();
      await addProduct(response, lackingPrice);
      expect(response.statusCode).to.equal(400);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
      expect(response._getJSONData()).to.be.an('Object');
    });

    it('should round price to the nearest cent', async () => {
      const offPriceProduct = { ...dummyProduct, price: 199.2118 };
      let response = createResponse();
      await addProduct(response, offPriceProduct);

      expect(response.statusCode).to.equal(201);
      const addedProduct = response._getJSONData();
      expect(addedProduct.price).to.equal(199.21);
    });
  })

  describe('updateProduct()', () => {

    it('should successfully change a product in DB', async () => {
      const oldProduct = await Product.findOne({name: "Small Cotton Chicken"}).exec();
      const productId = oldProduct._id;

      const updatedValues = {
        price: 119.99,
        description: "Now 40% cheaper!"
      };

      const response = createResponse();
      await updateProduct(response, productId, updatedValues);

      expect(response.statusCode).to.equal(200);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
      
      // Check the response is updated
      const result = response._getJSONData();
      expect(result).to.be.an('Object');
      expect(result.name).to.equal(oldProduct.name);
      expect(result.price).to.equal(updatedValues.price);
      expect(result.image).to.equal(oldProduct.image);
      expect(result.description).to.equal(updatedValues.description);

      // Ensure changes have been made in DB
      const updatedProduct = await Product.findById(productId).exec();
      expect(updatedProduct.name).to.equal(oldProduct.name);
      expect(updatedProduct.price).to.equal(updatedValues.price);
    });

    it('should disallow changing price to negative', async () => {
      const oldProduct = await Product.findOne({name: "Small Cotton Chicken"}).exec();
      const productId = oldProduct._id;

      const updatedValues = {
        price: -19.99,
        description: "Now 110% cheaper!"
      };

      const response = createResponse();
      await updateProduct(response, productId, updatedValues);

      expect(response.statusCode).to.equal(400);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;
    });

    it("shouldn't work with wrong ID", async () => {
      const faultyId = "000000000000000000000000";
      const updatedValues = {
        price: 119.99,
        description: "Now 40% cheaper!"
      };

      const response = createResponse();
      await updateProduct(response, faultyId, updatedValues);
      expect(response.statusCode).to.equal(404);
      expect(response._isEndCalled()).to.be.true;
    });
  });

  describe('deleteProduct()', () => {

    it('should delete an item from the DB', async () => {
      const oldProduct = await Product.findOne({name: "Small Cotton Chicken"}).exec();
      const productId = oldProduct._id;

      const response = createResponse();
      await deleteProduct(response, productId);

      expect(response.statusCode).to.equal(200);
      expect(response.getHeader('content-type')).to.equal('application/json');
      expect(response._isJSON()).to.be.true;
      expect(response._isEndCalled()).to.be.true;

      // Check that the response data is correct
      const returnedData = response._getJSONData();
      expect(returnedData).to.be.an('object');
      expect(returnedData.name).to.equal(oldProduct.name);
      expect(returnedData.price).to.equal(oldProduct.price);
      expect(returnedData.image).to.equal(oldProduct.image);
      expect(returnedData.description).to.equal(oldProduct.description);

      const allProducts = await Product.find({}).exec();
      expect(allProducts.length).to.equal(originalProducts.length - 1);

      const deletedProduct = await Product.findById(productId).exec();
      expect(deletedProduct).to.equal(null);
    });
    
    it('should fail on wrong ID', async () => {
      const faultyId = "000000000000000000000000";

      const response = createResponse();
      await deleteProduct(response, faultyId);
      expect(response.statusCode).to.equal(404);
      expect(response._isEndCalled()).to.be.true;
    });
  });
});
