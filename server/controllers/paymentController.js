const juspay = require('../services/juspay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');

// @desc    Create a payment session with Juspay (or sandbox simulator)
// @route   POST /api/payments/create-session
// @access  Private (Customer)
const createPaymentSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate payment for order in status '${order.status}'`
      });
    }

    const clientReturnUrl = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/order-status/${order.orderId}`;
    let paymentLink = null;
    let orderSessionId = null;

    // Attempt live Juspay SDK call if initialized
    if (juspay && typeof juspay.orderSession?.create === 'function') {
      try {
        const sessionPayload = {
          order_id: order.orderId,
          amount: Number(order.totalAmount).toFixed(2),
          customer_id: req.user._id.toString(),
          customer_email: req.user.email,
          customer_phone: req.user.phone || '9999999999',
          payment_page_client_id: process.env.JUSPAY_CLIENT_ID || 'quickkart_client',
          return_url: clientReturnUrl,
          currency: 'INR'
        };

        const sessionResponse = await juspay.orderSession.create(sessionPayload);
        orderSessionId = sessionResponse.id || sessionResponse.order_id;
        paymentLink = sessionResponse.payment_links?.web || sessionResponse.payment_links?.iframe || null;
      } catch (sdkError) {
        console.warn('Juspay SDK session creation call failed, falling back to simulated sandbox session:', sdkError.message);
      }
    }

    // If sandbox simulator fallback is used
    if (!paymentLink) {
      paymentLink = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/checkout/sandbox-gateway?orderId=${order.orderId}&amount=${order.totalAmount}`;
      orderSessionId = `sandbox_sess_${Date.now()}`;
    }

    // Create or update Payment record
    let payment = await Payment.findOne({ orderId: order.orderId });
    if (!payment) {
      payment = await Payment.create({
        orderId: order.orderId,
        juspayTxnId: orderSessionId,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'PENDING',
        paymentMethod: 'UPI'
      });
    } else {
      payment.status = 'PENDING';
      payment.juspayTxnId = orderSessionId;
      await payment.save();
    }

    // Link payment ID to Order
    order.paymentId = payment._id;
    await order.save();

    res.status(200).json({
      success: true,
      orderId: order.orderId,
      amount: order.totalAmount,
      sessionId: orderSessionId,
      paymentLink,
      returnUrl: clientReturnUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook handler for asynchronous Juspay status callbacks
// @route   POST /api/payments/webhook
// @access  Public (Called by Juspay server)
const handleWebhook = async (req, res, next) => {
  try {
    const payload = req.body || {};
    console.log('Received Juspay Webhook event:', payload);

    // Support both direct fields and nested content payloads
    const eventData = payload.content?.order || payload;
    const orderId = eventData.order_id || payload.order_id;
    const status = eventData.status || payload.status;
    const txnId = eventData.txn_id || payload.txn_id || `txn_${Date.now()}`;
    const paymentMethod = eventData.payment_method || payload.payment_method || 'UPI';

    if (!orderId) {
      return res.status(400).send('Missing order_id');
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Update payment record
    let payment = await Payment.findOne({ orderId });
    if (!payment) {
      payment = new Payment({
        orderId,
        amount: order.totalAmount,
        currency: 'INR'
      });
    }

    payment.juspayTxnId = txnId;
    payment.paymentMethod = paymentMethod;
    payment.gatewayResponse = payload;

    // Handle status transitions
    if (status === 'CHARGED') {
      order.status = 'CONFIRMED';
      payment.status = 'CHARGED';

      // Deduct inventory stock for confirmed items
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty }
        });
      }
    } else if (['AUTHENTICATION_FAILED', 'AUTHORIZATION_FAILED', 'JUSPAY_DECLINED'].includes(status)) {
      order.status = 'PAYMENT_FAILED';
      payment.status = status;
    }

    await order.save();
    await payment.save();

    // Juspay requires 200 OK fast response
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook error');
  }
};

// @desc    Explicitly verify payment status (Fallback / Polling check)
// @route   POST /api/payments/verify-status
// @access  Private
const verifyPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findOne({ orderId }).populate('paymentId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Try status check with Juspay SDK if available
    let latestStatus = order.status;
    if (juspay && typeof juspay.order?.status === 'function') {
      try {
        const juspayStatus = await juspay.order.status(orderId);
        if (juspayStatus.status === 'CHARGED' && order.status !== 'CONFIRMED') {
          order.status = 'CONFIRMED';
          if (order.paymentId) {
            await Payment.findByIdAndUpdate(order.paymentId, { status: 'CHARGED' });
          }
          await order.save();
          latestStatus = 'CONFIRMED';
        }
      } catch (sdkErr) {
        console.warn('Juspay order status check failed:', sdkErr.message);
      }
    }

    res.status(200).json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      payment: order.paymentId
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate sandbox payment (For testing & development)
// @route   POST /api/payments/simulate-sandbox-pay
// @access  Public
const simulateSandboxPayment = async (req, res, next) => {
  try {
    const { orderId, status = 'CHARGED', paymentMethod = 'UPI' } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Call internal webhook logic with simulated payload
    const simulatedTxnId = `SIM_JUSPAY_${Date.now()}`;
    const simulatedPayload = {
      order_id: orderId,
      status,
      txn_id: simulatedTxnId,
      amount: order.totalAmount,
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    };

    // Update order and payment directly
    let payment = await Payment.findOne({ orderId });
    if (!payment) {
      payment = new Payment({
        orderId,
        amount: order.totalAmount,
        currency: 'INR'
      });
    }

    payment.juspayTxnId = simulatedTxnId;
    payment.paymentMethod = paymentMethod;
    payment.status = status;
    payment.gatewayResponse = simulatedPayload;
    await payment.save();

    if (status === 'CHARGED') {
      order.status = 'CONFIRMED';
      order.paymentId = payment._id;

      // Deduct inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty }
        });
      }
    } else {
      order.status = 'PAYMENT_FAILED';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Simulated Juspay payment processed as ${status}`,
      orderId: order.orderId,
      orderStatus: order.status,
      payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentSession,
  handleWebhook,
  verifyPaymentStatus,
  simulateSandboxPayment
};
