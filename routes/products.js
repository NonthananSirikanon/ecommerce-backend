const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category, Review } = require('../models');
const { auth, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('categoryId').optional().isUUID(4).withMessage('Invalid category ID'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('sort').optional().isIn(['price', '-price', 'name', '-name', 'createdAt', '-createdAt', 'averageRating', '-averageRating']).withMessage('Invalid sort option')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let where = { isActive: true };

    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId;
    }

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    if (req.query.brand) {
      where.brand = { [Op.iLike]: `%${req.query.brand}%` };
    }

    if (req.query.tags) {
      where.tags = { [Op.overlap]: req.query.tags.split(',') };
    }

    let order = [['created_at', 'DESC']];
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      // Convert camelCase to snake_case for database fields
      const dbSortField = sortField === 'createdAt' ? 'created_at' : 
                         sortField === 'averageRating' ? 'average_rating' : sortField;
      order = [[dbSortField, sortDirection]];
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
      }],
      order,
      offset: skip,
      limit,
      attributes: { exclude: ['created_at', 'updated_at'] }
    });

    const total = await Product.count({ where });
    const totalPages = Math.ceil(total / limit);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Skip active check for admin or if product is active
    if (!product.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [
  auth,
  admin,
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isUUID(4).withMessage('Valid category ID is required'),
  body('categoryName').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('image').optional().trim().notEmpty().withMessage('Product image cannot be empty'),
  body('inventory.quantity').isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let categoryId = req.body.categoryId;
    
    // If categoryName is provided instead of categoryId, find the category by name
    if (!categoryId && req.body.categoryName) {
      const category = await Category.findOne({ 
        where: { name: { [Op.iLike]: req.body.categoryName } } 
      });
      if (!category) {
        return res.status(400).json({ message: `Category '${req.body.categoryName}' not found` });
      }
      categoryId = category.id;
    }
    
    // If no category specified, use default "General" category or create one
    if (!categoryId) {
      let defaultCategory = await Category.findOne({ 
        where: { name: { [Op.iLike]: 'General' } } 
      });
      
      if (!defaultCategory) {
        defaultCategory = await Category.create({
          name: 'General',
          slug: 'general',
          isActive: true
        });
      }
      
      categoryId = defaultCategory.id;
    }
    
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Set categoryId for the product
    const productData = { ...req.body };
    productData.categoryId = categoryId; // Use categoryId (not category_id) for Sequelize
    delete productData.categoryName;
    
    // Auto-generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now();
      const productName = productData.name.replace(/\s+/g, '-').toUpperCase();
      productData.sku = `${productName.substring(0, 6)}-${timestamp.toString().slice(-6)}`;
    }

    const product = new Product(productData);
    await product.save();

    await product.reload({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
      }]
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', [
  auth,
  admin,
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').optional().isUUID(4).withMessage('Valid category ID is required'),
  body('inventory.quantity').optional().isInt({ min: 0 }).withMessage('Inventory quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.body.category) {
      const categoryExists = await Category.findByPk(req.body.categoryId);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    await Product.update(req.body, { where: { id: req.params.id } });
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
      }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/reviews', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    };

    product.reviews.push(review);
    product.updateRating();
    await product.save();

    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review: product.reviews[product.reviews.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only endpoint to get all products including inactive ones
router.get('/admin/all', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Status must be active, inactive, or all'),
  query('categoryId').optional().isUUID(4).withMessage('Invalid category ID'),
  query('sort').optional().isIn(['name', '-name', 'created_at', '-created_at', 'price', '-price']).withMessage('Invalid sort option')
], auth, admin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let where = {};

    // Admin can see all products or filter by status
    if (req.query.status === 'active') {
      where.isActive = true;
    } else if (req.query.status === 'inactive') {
      where.isActive = false;
    }
    // If status is 'all' or not provided, show all products

    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId;
    }

    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
        { sku: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }

    let order = [['created_at', 'DESC']];
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.slice(1) : req.query.sort;
      const sortDirection = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      const dbSortField = sortField === 'created_at' ? 'created_at' : sortField;
      order = [[dbSortField, sortDirection]];
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
      }],
      order,
      offset: skip,
      limit
    });

    const total = await Product.count({ where });
    const totalPages = Math.ceil(total / limit);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update product status
router.patch('/admin/bulk-status', [
  auth,
  admin,
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('productIds.*').isUUID(4).withMessage('All product IDs must be valid UUIDs'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productIds, isActive } = req.body;

    const [updatedCount] = await Product.update(
      { isActive },
      { 
        where: { 
          id: { [Op.in]: productIds }
        }
      }
    );

    res.json({
      message: `${updatedCount} products updated successfully`,
      updatedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product inventory
router.patch('/admin/:id/inventory', [
  auth,
  admin,
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be a non-negative integer'),
  body('trackInventory').optional().isBoolean().withMessage('Track inventory must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedInventory = {
      ...product.inventory,
      ...req.body
    };

    await Product.update(
      { inventory: updatedInventory },
      { where: { id: req.params.id } }
    );

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'slug']
      }]
    });

    res.json({
      message: 'Product inventory updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Category.findAll({ 
      where: { isActive: true },
      attributes: ['name', 'slug', 'parent'],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;