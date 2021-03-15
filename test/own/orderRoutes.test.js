const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const Order = require('../../models/order');
const { handleRequest } = require('../../routes');
const ordersUrl = '/api/orders';
const contentType = 'application/json';
chai.use(chaiHttp);

// helper function for authorization headers
const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));

const adminUser = { ...users.find(u => u.role === 'admin') };

const adminCredentials = encodeCredentials(adminUser.email, adminUser.password);

describe('orderRoutes', () => {
  describe('handleAllOrdersRequest', () => {
    it('should respond with "405 Method Not Allowed to an unsupported method"', async () => {
      const response = await chai
        .request(handleRequest)
        .put(ordersUrl)
        .set('Accept', contentType)
        .set('Authorization', `Basic ${adminCredentials}`)
        .send({});
      expect(response).to.have.status(405);
    });
    it('should respond with "204 No Content" to an OPTIONS request', async () => {
      const response = await chai.request(handleRequest).options(ordersUrl);
      expect(response).to.have.status(204);
    });
  });
  describe('handleOrdersIdRequest', () => {
    it('should respond with "204 No Content" to an OPTIONS request', async () => {
      const response = await chai.request(handleRequest).options(`/api/orders/${adminUser.id}`)
    });
    it('should 405 Method Not Allowed to an unsupported method"', async () => {
      const response = await chai
        .request(handleRequest)
        .put(`/api/orders/${adminUser.id}`)
        .set('Accept', contentType)
        .set('Authorization', `Basic ${adminCredentials}`)
        .send({})
    });
  });
});
