const mongoose = require('mongoose');

/**
 * Get database connect URL.
 *
 * Reads URL from DBURL environment variable or
 * returns default URL if variable is not defined
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  return (process.env.DBURL) ? process.env.DBURL : "mongodb://localhost:27017/WebShopDb";
};

/**
 * Connect to database
 */
function connectDB () {
  // Do nothing if already connected
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * handles errors
 */
function handleCriticalError (err) {
  console.error(err);
  throw err;
}

/**
 * disconnects database
 */
function disconnectDB () {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };
