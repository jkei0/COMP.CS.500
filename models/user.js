const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

const trim = (text) => {
  return text.trim();
};

const setPassword = (password) => {
  // minlength 10 will fail the empty password in validation
  if (password.length < 10) {
    return "";
  }
  return bcrypt.hashSync(password, salt);
};

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    set: trim
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: emailRegex
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    set: setPassword
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
    lowercase: true,
    set: trim
  }
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password supplied password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
