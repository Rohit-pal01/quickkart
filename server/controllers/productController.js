const Product = require('../models/Product');

// @desc    Get all products with filtering, search & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = 1,
      limit = 40
    } = req.query;

    const query = { isActive: true };

    // Search by product name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by in-stock availability
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'stock') sortOption = { stock: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categoriesWithCount = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          sampleImage: { $first: '$imageUrl' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = categoriesWithCount.map(c => ({
      name: c._id,
      itemCount: c.count,
      sampleImage: c.sampleImage
    }));

    res.status(200).json({
      success: true,
      categories: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, mrp, unit, stock, imageUrl, shelfLife, dietType } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required fields'
      });
    }

    const numericPrice = Number(price);
    const numericMrp = mrp !== undefined && mrp !== '' ? Number(mrp) : numericPrice;

    if (numericMrp < numericPrice) {
      return res.status(400).json({
        success: false,
        message: 'Selling price cannot exceed Maximum Retail Price (MRP)'
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: numericPrice,
      mrp: numericMrp,
      unit: unit || '1 unit',
      stock: Number(stock) || 0,
      imageUrl: imageUrl || '',
      shelfLife: shelfLife || 'Best before 4 months from packaging',
      dietType: dietType || 'Vegetarian',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const targetPrice = req.body.price !== undefined ? Number(req.body.price) : product.price;
    const targetMrp = req.body.mrp !== undefined && req.body.mrp !== '' ? Number(req.body.mrp) : (product.mrp || targetPrice);

    if (targetMrp < targetPrice) {
      return res.status(400).json({
        success: false,
        message: 'Selling price cannot exceed Maximum Retail Price (MRP)'
      });
    }

    const fieldsToUpdate = [
      'name', 'description', 'category', 'price', 'mrp', 'unit', 'stock', 'imageUrl', 'shelfLife', 'dietType', 'isActive'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore default store catalog
// @route   POST /api/products/restore-catalog
// @access  Private (Real Admin only)
const restoreDefaultCatalog = async (req, res, next) => {
  try {
    const sampleProducts = require('../seed/catalog');
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    res.status(200).json({
      success: true,
      message: `Successfully restored ${inserted.length} catalog products!`,
      count: inserted.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreDefaultCatalog
};
