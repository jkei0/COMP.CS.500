const chai = require('chai');
const expect = chai.expect;
const { createResponse } = require('node-mocks-http');
const {
  getAllUsers,
  registerUser,
  deleteUser,
  viewUser,
  updateUser
} = require('../../controllers/users');

const User = require('../../models/user');

// Get users (create copies for test isolation)
const users = require('../../setup/users.json').map(user => ({ ...user }));
const adminUser = { ...users.find(u => u.role === 'admin') };
const customerUser = { ...users.find(u => u.role === 'customer') };

describe('Users Controller', () => {
  beforeEach(async () => {
    // reset database
    await User.deleteMany({});
    await User.create(users);

    // set variables
    currentUser = await User.findOne({ email: adminUser.email }).exec();
    customer = await User.findOne({ email: customerUser.email }).exec();
    response = createResponse();
  });
  it('should respond with "403 Forbidden" when deleting user with customer role', async () => {
    const userId = currentUser.id.split('').reverse().join('');
    await deleteUser(response, userId, customer);
    expect(response.statusCode).to.equal(403);
  });
  it('should respond with "403 Forbidden" when updating user with customer role', async () => {
    const userId = currentUser.id.split('').reverse().join('');
    await updateUser(response, userId, customer, currentUser);
    expect(response.statusCode).to.equal(403);
  });
  it('should respond with "403 Forbidden" when looking user with customer role', async () => {
    const userId = currentUser.id.split('').reverse().join('');
    await viewUser(response, userId, customer);
    expect(response.statusCode).to.equal(403);
  });
});
