const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customerId: {
    type: String,
    required: true
  },
  products: [{
    product: {
      _id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0.01
      },
      description: {
        type: String
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: (value) => {
          return value % 1 === 0;
        },
        message: props => `Quantity needs to be an integer (was ${props.value})`
      }
    }
  }]
});

// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;
