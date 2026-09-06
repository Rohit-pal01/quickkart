const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreDefaultCatalog
} = require('../controllers/productController');
const { protect, authorize, restrictDemo } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only management routes (Protected + Blocked for Demo Admin)
router.post('/', protect, authorize('admin'), restrictDemo, createProduct);
router.put('/:id', protect, authorize('admin'), restrictDemo, updateProduct);
router.delete('/:id', protect, authorize('admin'), restrictDemo, deleteProduct);
router.post('/restore-catalog', protect, authorize('admin'), restrictDemo, restoreDefaultCatalog);

module.exports = router;
