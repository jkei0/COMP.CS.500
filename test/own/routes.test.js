const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const { handleRequest } = require('../../routes');

const url = '/test';

describe('Routes', () => {
  it('Should response with "405 method not allowed"', async () => {
    const response = await chai
      .request(handleRequest)
      .post(url)
      .send({})
    expect(response).to.have.status(405);
  });
  it('Should put respond with statuscode 200', async () => {
    const response = await chai
      .request(handleRequest)
      .get('/')
      .send({})
    expect(response).to.have.status(200);
  });
});
