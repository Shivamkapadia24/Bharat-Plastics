const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Import Schema

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // NEW: role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    }
  ],

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }
  ]
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;