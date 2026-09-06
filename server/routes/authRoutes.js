const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  addAddress,
  deleteAddress,
  getAllUsers,
  deleteUser,
  impersonateUser
} = require('../controllers/authController');
const { protect, authorize, restrictDemo } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), restrictDemo, deleteUser);
router.post('/impersonate/:id', protect, authorize('admin'), restrictDemo, impersonateUser);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

module.exports = router;


