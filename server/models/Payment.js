const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  juspayTxnId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String },
  status: {
    type: String,
    enum: [
      'CREATED', 'PENDING', 'CHARGED', 'AUTHENTICATION_FAILED',
      'AUTHORIZATION_FAILED', 'JUSPAY_DECLINED', 'REFUNDED'
    ],
    default: 'CREATED'
  },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
