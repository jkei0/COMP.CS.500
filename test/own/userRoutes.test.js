const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { handleRequest } = require('../../routes');
const urlRegister = '/api/register';
const userUrl = '/api/users'
const contentType = 'application/json';
const User = require('../../models/user');

chai.use(chaiHttp);

// helper function for authorization headers
const encodeCredentials = (username, password) =>
  Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));
const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

const adminCredentials = encodeCredentials(adminUser.email, adminUser.password);
const customerCredentials = encodeCredentials(customerUser.email, customerUser.password);
const invalidCredentials = encodeCredentials(adminUser.email, customerUser.password);

describe('userRoute', () => {
  describe('handleRegisterUserRequest', () => {
    it('should respond with "204" to an OPTIONS request', async () => {
      const response = await chai.request(handleRequest).options(urlRegister);
      expect(response).to.have.status(204);
    });
    it('should respond with "405 Method Not Allowed" to an unsupported method', async () => {
      const response = await chai
      .request(handleRequest)
      .get(urlRegister)
      .set('Accept', contentType)
      .send({});
      expect(response).to.have.status(405);
    });
  });
  describe('handleUserIdRequest', () => {
    beforeEach(async () => {
      // reset database
      await User.deleteMany({});
      await User.create(users);

      // set variables
      customer = await User.findOne({ email: customerUser.email }).exec();
      url = `${userUrl}/${customer.id}`;
    });
    it('should respond with "204" to an OPTIONS request', async () => {
      const response = await chai
        .request(handleRequest)
        .options(url)
        .set('Accept', contentType)
        .set('Authorization', `Basic ${adminCredentials}`)
        .send({});
      expect(response).to.have.status(204);
    });
    it('should respond with "405 Method Not Allowed" to an unsupported method', async () => {
      const response = await chai
        .request(handleRequest)
        .post(url)
        .set('Accept', contentType)
        .set('Authorization', `Basic ${adminCredentials}`)
        .send({});
      expect(response).to.have.status(405);
    });
    it('should respond with "400 Bad Request" when request body is not valid JSON', async () => {
      const body = "Not valid JSON";
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
