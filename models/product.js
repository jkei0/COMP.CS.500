const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roundToCent = (value) => {
  if (typeof value !== "number") { return value; }
  return Math.round(value * 100) / 100;
};

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0.05,
    set: roundToCent
  },
  image: {
    type: String
  },
  description: {
    type: String
}
});

// Omit the version key when serialized to JSON
productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;
