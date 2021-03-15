const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { handleRequest } = require('../../routes');
const productsUrl = '/api/products';
const contentType = 'application/json';
chai.use(chaiHttp);
const Product = require('../../models/product');

// helper function for authorization headers
const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

  // Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));
const adminUser = { ...users.find(u => u.role === 'admin') };
const adminCredentials = encodeCredentials(adminUser.email, adminUser.password);

describe('productRoutes', () => {
  describe('handleAllProductsRequest', () => {
    it('should respond with "204 No Content" to an OPTIONS request', async () => {
      const response = await chai.request(handleRequest).options(productsUrl);
      expect(response).to.have.status(204);
    });
    it('should respond with "405 Method Not Allowed" to an unsupported method', async () => {
      const response = await chai
        .request(handleRequest)
        .put(productsUrl)
        .set('Accept', contentType)
        .send({});
      expect(response).to.have.status(405);
    });
  });
  describe('handleProductsIdRequest', () => {
    it('should respond with "204 No Content" to an OPTIONS request', async () => {
      const testProduct = await Product.findOne({}).exec();
      const url = `${productsUrl}/${testProduct.id}`;
      const response = await chai.request(handleRequest).options(url);
      expect(response).to.have.status(204);
    });
    it('should respond with "405 Method Not Allowed" to an unsupported method', async () => {
      const testProduct = await Product.findOne({}).exec();
      const url = `${productsUrl}/${testProduct.id}`;
      const response = await chai
        .request(handleRequest)
        .post(url)
        .set('Accept', contentType)
        .send({});
      expect(response).to.have.status(405);
    });
    it('should respond with "400 Bad Request" when request body is not valid JSON', async () => {
      const testProduct = await Product.findOne({}).exec();
      const url = `${productsUrl}/${testProduct.id}`;
      const body = "Not Valid JSON";
      const response = await chai
        .request(handleRequest)
        .put(url)
        .set('Accept', contentType)
        .set('Authorization', `Basic ${adminCredentials}`)
        .send(body);
      expect(response).to.have.status(400);
    });
  });
});
