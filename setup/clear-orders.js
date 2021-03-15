const path = require('path');
const dotEnvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotEnvPath });

const { connectDB, disconnectDB } = require('../models/db');
const Order = require('../models/order');

(async () => {
  connectDB();
  await Order.deleteMany({})
  disconnectDB();
})();
