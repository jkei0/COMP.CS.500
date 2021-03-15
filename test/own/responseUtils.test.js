const chai = require('chai');
const { createResponse } = require('node-mocks-http');
const responseUtils = require('../../utils/responseUtils');
const expect = chai.expect;

describe('Response Utils', () => {
  it('redirectToPage should return with code 302 and new page', () => {
    const response = createResponse();
    responseUtils.redirectToPage(response, '/test/page');
    expect(response.statusCode).to.equal(302);
    expect(response._headers.location).to.equal('/test/page')
  });
});
