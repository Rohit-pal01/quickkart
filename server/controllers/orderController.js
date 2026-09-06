const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

// Generate unique human-readable Order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QK-${timestamp}-${random}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!deliveryAddress || !deliveryAddress.line1) {
      return res.status(400).json({
        success: false,
        message: 'Valid delivery address with line1 is required'
      });
    }

    // Fetch product details from DB to calculate subtotal server-side (prevent price tampering)
    const productIds = items.map(item => item.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId.toString());
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with id ${item.productId} is unavailable or invalid`
        });
      }

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${qty}`
        });
      }

      const itemTotal = product.price * qty;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price: product.price
      });
    }

    // Quick commerce delivery fee: Free delivery on orders > ₹199, else ₹25
    const deliveryFee = calculatedSubtotal >= 200 ? 0 : 25;
    const totalAmount = calculatedSubtotal + deliveryFee;

    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      userId: req.user._id,
      items: validatedItems,
      deliveryAddress: {
        line1: deliveryAddress.line1,
        lat: deliveryAddress.lat || null,
        lng: deliveryAddress.lng || null
      },
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount,
      status: 'PENDING_PAYMENT'
    });

    res.status(201).json({
      success: true,
      message: 'Order created, proceeding to payment',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by orderId or Mongo ID
// @route   GET /api/orders/:identifier
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    // Search by human-readable orderId or ObjectId
    let order;
    if (identifier.startsWith('QK-')) {
      order = await Order.findOne({ orderId: identifier })
        .populate('paymentId')
        .populate('userId', 'name email phone');
    } else {
      order = await Order.findById(identifier)
        .populate('paymentId')
        .populate('userId', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Ensure customer can only view their own order unless admin or delivery role
    const orderUserId = order.userId ? (order.userId._id ? order.userId._id.toString() : order.userId.toString()) : null;
    const isOwner = orderUserId && orderUserId === req.user._id.toString();
    const isStaff = ['admin', 'delivery'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin / Delivery)
// @route   GET /api/orders
// @access  Private (Admin, Delivery)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin, Delivery)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      'PENDING_PAYMENT',
      'CONFIRMED',
      'PACKED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'PAYMENT_FAILED',
      'REFUND_INITIATED',
      'REFUNDED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer)
// @route   POST /api/orders/:id/cancel
// @access  Private (Customer/Admin)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify ownership
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Allow cancellation only before OUT_FOR_DELIVERY as per SRS FR-10.1
    const nonCancellable = ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (nonCancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in state '${order.status}'`
      });
    }

    order.status = 'CANCELLED';
    await order.save();

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate an incoming live order for Dark Store testing & demos
// @route   POST /api/orders/simulate
// @access  Private (Admin)
const simulateIncomingOrder = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const products = await Product.find({ isActive: true }).limit(20);
    if (!products.length) {
      return res.status(400).json({ success: false, message: 'No active products available to simulate order' });
    }

    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const pickedProducts = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);

    const sampleCustomers = [
      { name: 'Priya Sharma', phone: '9845123456', address: 'Flat 302, Palm Meadows, Indiranagar, Bengaluru' },
      { name: 'Karthik Verma', phone: '9876541230', address: 'Villa 14, Green Glen Layout, Bellandur, Bengaluru' },
      { name: 'Ananya Roy', phone: '9765432109', address: '12th Cross, Sector 4, HSR Layout, Bengaluru' },
      { name: 'Sneha Patel', phone: '9812345678', address: 'Tower B, Sobha Iris, Outer Ring Road, Bengaluru' },
      { name: 'Rohan Iyer', phone: '9900112233', address: '4th Main Road, Domlur 2nd Stage, Bengaluru' }
    ];
    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];

    let subtotal = 0;
    const items = pickedProducts.map(p => {
      const qty = Math.floor(Math.random() * 2) + 1;
      const total = p.price * qty;
      subtotal += total;
      return {
        productId: p._id,
        name: p.name,
        price: p.price,
        qty,
        total,
        imageUrl: p.imageUrl
      };
    });

    const deliveryFee = subtotal >= 199 ? 0 : 25;
    const platformFee = 5;
    const totalAmount = subtotal + deliveryFee + platformFee;

    const customerUser = await User.findOne({ role: 'customer' });
    const targetUserId = customerUser ? customerUser._id : req.user._id;

    const order = await Order.create({
      orderId: generateOrderId(),
      userId: targetUserId,
      items,
      subtotal,
      deliveryFee,
      platformFee,
      totalAmount,
      status: 'CONFIRMED',
      paymentMethod: 'UPI',
      deliveryAddress: {
        label: 'Home',
        line1: customer.address,
        lat: 12.9716 + (Math.random() - 0.5) * 0.04,
        lng: 77.5946 + (Math.random() - 0.5) * 0.04
      },
      confirmedAt: new Date()
    });

    const populatedOrder = {
      ...order.toObject(),
      userId: {
        _id: targetUserId,
        name: customer.name,
        phone: customer.phone,
        email: `${customer.name.toLowerCase().replace(' ', '.')}@example.com`
      }
    };

    res.status(201).json({
      success: true,
      message: `Simulated live order #${order.orderId} from ${customer.name}!`,
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  simulateIncomingOrder
};
