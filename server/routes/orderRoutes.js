const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  simulateIncomingOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.post('/:id/cancel', protect, cancelOrder);

// Admin & Staff routes
router.get('/', protect, authorize('admin', 'delivery'), getAllOrders);
router.post('/simulate', protect, authorize('admin'), simulateIncomingOrder);
router.put('/:id/status', protect, authorize('admin', 'delivery'), updateOrderStatus);

// Order lookup by ID or orderId (accessible by customer who placed it or staff)
router.get('/:identifier', protect, getOrderById);

module.exports = router;
