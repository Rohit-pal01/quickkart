const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const deliveryAddressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  deliveryAddress: deliveryAddressSchema,
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      'PENDING_PAYMENT', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY',
      'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED', 'REFUND_INITIATED', 'REFUNDED'
    ],
    default: 'PENDING_PAYMENT'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
