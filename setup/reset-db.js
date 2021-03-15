const path = require('path');
const dotEnvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotEnvPath });

const { connectDB, disconnectDB } = require('../models/db');
const User = require('../models/user');
const Product = require('../models/product');

const users = require('./users.json').map(user => ({ ...user }));
const products = require('./products.json').map(product => ({ ...product }));

(async () => {
  connectDB();

  try {
    const Order = require('../models/order');
    await Order.deleteMany({});
  } catch (error) {}

  await Product.deleteMany({});
  await Product.create(products);
  console.log('Created products');

  await User.deleteMany({});
  await User.create(users);
  console.log('Created users');

  disconnectDB();
})();
