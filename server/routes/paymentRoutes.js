const express = require('express');
const router = express.Router();
const {
  createPaymentSession,
  handleWebhook,
  verifyPaymentStatus,
  simulateSandboxPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Customer checkout session creation
router.post('/create-session', protect, createPaymentSession);

// Asynchronous Webhook callback from Juspay server
router.post('/webhook', handleWebhook);

// Status verification endpoint (fallback)
router.post('/verify-status', protect, verifyPaymentStatus);

// Sandbox testing simulation route
router.post('/simulate-sandbox-pay', simulateSandboxPayment);

module.exports = router;
