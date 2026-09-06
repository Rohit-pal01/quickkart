const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  unit: { type: String },
  stock: { type: Number, default: 0 },
  imageUrl: { type: String },
  shelfLife: { type: String, default: 'Best before 4 months from packaging' },
  dietType: { type: String, default: 'Vegetarian' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
