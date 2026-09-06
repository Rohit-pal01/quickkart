const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'quickkart_jwt_secret_dev_key_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const userAddresses = [];
    if (address && typeof address === 'string' && address.trim()) {
      userAddresses.push({
        label: 'Home',
        line1: address.trim()
      });
    } else if (address && typeof address === 'object' && address.line1) {
      userAddresses.push({
        label: address.label || 'Home',
        line1: address.line1.trim()
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: password, // Will be hashed in pre-save hook
      role: role && ['customer', 'admin', 'delivery'].includes(role) ? role : 'customer',
      addresses: userAddresses
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add delivery address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { label, line1, lat, lng } = req.body;

    if (!line1) {
      return res.status(400).json({
        success: false,
        message: 'Address line1 is required'
      });
    }

    const user = await User.findById(req.user._id);
    user.addresses.push({
      label: label || 'Home',
      line1,
      lat: lat || null,
      lng: lng || null
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page, limit } = req.query;

    const query = {};

    if (role && role !== 'ALL') {
      query.role = role.toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { 'addresses.line1': regex }
      ];
    }

    if (limit && parseInt(limit) > 0) {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = parseInt(limit) || 20;
      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        count: users.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        users
      });
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Safety check: Prevent admin from deleting their own active account
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own logged-in admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Impersonate / Log in as customer (Admin only)
// @route   POST /api/auth/impersonate/:id
// @access  Private/Admin
const impersonateUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const token = generateToken(targetUser._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: targetUser._id,
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role,
        addresses: targetUser.addresses
      },
      message: `Switched session to ${targetUser.name}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  addAddress,
  deleteAddress,
  getAllUsers,
  deleteUser,
  impersonateUser
};
